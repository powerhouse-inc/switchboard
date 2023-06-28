import type { PrismaClient } from '@prisma/client';
import { SiweMessage } from 'siwe';
import { GraphQLError } from 'graphql';
import url from 'url';
import { randomUUID } from 'crypto';
import { getUserCrud } from '../User';
import { getSessionCrud } from '../Session';
import { getChildLogger } from '../../logger';
import { API_ORIGIN } from '../../env';

const logger = getChildLogger({ msgPrefix: 'Challenge' });

const verifySignature = async (parsedMessage: SiweMessage, signature: string) => {
  try {
    const response = await parsedMessage.verify({
      time: new Date().toISOString(),
      signature,
    });
    logger.debug('verifySignature', response);
    return response;
  } catch (error) {
    logger.error('Invalid signature', parsedMessage, signature);
    throw new GraphQLError('Invalid signature');
  }
};

const textToHex = (textMessage: string) => `0x${Buffer.from(textMessage, 'utf8').toString('hex')}`;

export function getChallengeCrud(prisma: PrismaClient) {
  return {

    async createChallenge(address: string) {
      logger.debug('createChallenge: received', address);

      const origin = API_ORIGIN;
      const domain = url.parse(origin).hostname!;

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
      logger.debug('createChallenge: created message', textMessage, hexMessage);

      await prisma.challenge.create({
        data: {
          nonce,
          message: textMessage,
        },
      });
      return {
        nonce,
        message: textMessage,
        hex: hexMessage,
      };
    },

    async solveChallenge(nonce: string, signature: string) {
      logger.debug('solveChallenge: received', nonce, signature);

      // transaction is used to avoid race condition
      return prisma.$transaction(async (tx) => {
        const challenge = await tx.challenge.findFirst({
          where: {
            nonce: {
              equals: nonce,
            },
          },
        });
        logger.debug('solveChallenge: found challenge', challenge);

        // check that challenge with this nonce exists
        if (!challenge) {
          throw new GraphQLError('The nonce is not known');
        }

        // check that challenge was not used
        if (challenge.signature) {
          throw new GraphQLError('The signature was already used');
        }

        // verify signature
        const parsedMessage = new SiweMessage(challenge.message);
        try {
          await verifySignature(parsedMessage, signature);
        } catch (error) {
          throw new GraphQLError('Signature validation has failed');
        }

        // mark challenge as used
        await tx.challenge.update({
          where: {
            nonce,
          },
          data: {
            signature,
          },
        });

        // create user and session
        const user = await getUserCrud(tx).createUserIfNotExists({ address: parsedMessage.address });
        const tokenAndSession = await getSessionCrud(tx).createAuthenticationSession(user.address);

        return tokenAndSession;
      });
    },

  };
}
