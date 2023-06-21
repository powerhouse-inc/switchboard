import type { PrismaClient } from '@prisma/client';
import { SiweMessage } from 'siwe';
import { GraphQLError } from 'graphql';
import url from 'url';
import { randomUUID } from 'crypto';
import { getUserCrud } from '../User';
import { getSessionCrud } from '../Session';

const parseMessage = (message: string) => {
  try {
    return new SiweMessage(message);
  } catch (error) {
    console.error('Provided message has invalid format', error);
    throw new GraphQLError('Provided message has invalid format');
  }
};

const verifySignature = async (parsedMessage: SiweMessage, signature: string) => {
  try {
    const response = await parsedMessage.verify({
      time: new Date().toISOString(),
      signature,
    });
    console.log('response', response);
    return response;
  } catch (error) {
    console.error('Invalid signature', parsedMessage, signature);
    throw new GraphQLError('Invalid signature');
  }
};

const textToHex = (textMessage: string) => `0x${Buffer.from(textMessage, 'utf8').toString('hex')}`;

export function getChallengeCrud(prisma: PrismaClient) {
  return {

    async createChallenge(origin: string | undefined, address: string) {
      const domain = origin ? url.parse(origin).hostname : undefined;
      if (!domain) {
        throw new GraphQLError('Origin is missing');
      }
      // TODO: check domain
      const nonce = randomUUID().replace(/-/g, '');
      const textMessage = new SiweMessage({
        address,
        nonce,
        uri: origin,
        domain,
        version: '1',
        chainId: 1,
      }).prepareMessage();
      const hexMessage = textToHex(textMessage);
      await prisma.challenge.create({
        data: {
          nonce,
          message: textMessage,
        },
      });
      return {
        nonce,
        message: hexMessage,
      };
    },

    async solveChallenge(origin: string | undefined, nonce: string, signature: string) {
      const domain = origin ? url.parse(origin).hostname : undefined;
      if (!domain) {
        throw new GraphQLError('Origin is missing');
      }

      // transaction is used to avoid race condition
      return prisma.$transaction(async (tx) => {
        // find existing challange
        const challenge = await tx.challenge.findFirst({
          where: {
            nonce: {
              equals: nonce,
            },
          },
        });

        console.log('solveChallenge', challenge, origin, nonce, signature);
        // check that challenge with this nonce exists
        if (!challenge) {
          throw new GraphQLError('The nonce is not known');
        }

        // check that challenge is not used
        if (challenge.signature) {
          throw new GraphQLError('The challance was already used');
        }

        const parsedMessage = parseMessage(challenge.message);
        console.log('parsedMessage', parsedMessage);

        await verifySignature(parsedMessage, signature);

        // create new user
        const user = await getUserCrud(tx).createUserIfNotExists({ address: parsedMessage.address });

        // create new token and session
        const tokenAndsession = await getSessionCrud(tx).createAuthenticationSession(user.address, origin);

        // mark challenge as used
        await tx.challenge.update({
          where: {
            nonce,
          },
          data: {
            signature,
          },
        });
        return tokenAndsession;
      });
    },

  };
}
