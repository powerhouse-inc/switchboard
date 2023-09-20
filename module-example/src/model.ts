import type { PrismaClient } from '@prisma/client';
import { SiweMessage } from 'siwe';
import { GraphQLError } from 'graphql';
import url from 'url';
import { randomUUID } from 'crypto';
import { getModuleConfig } from './setup';

const verifySignature = async (parsedMessage: SiweMessage, signature: string) => {
  try {
    const response = await parsedMessage.verify({
      time: new Date().toISOString(),
      signature,
    });
    return response;
  } catch (error) {
    throw new GraphQLError('Invalid signature');
  }
};

const textToHex = (textMessage: string) => `0x${Buffer.from(textMessage, 'utf8').toString('hex')}`;

export function getChallengeCrud(prisma: PrismaClient) {
  const moduleConfig = getModuleConfig();
  return {

    async createChallenge(address: string) {

      const origin = moduleConfig.apiOrigin;
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

      // transaction is used to avoid race condition
      return (prisma as PrismaClient).$transaction(async (tx: any) => {
        const challenge = await tx.challenge.findFirst({
          where: {
            nonce: {
              equals: nonce,
            },
          },
        });

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
        const user = await moduleConfig.crud.getUserCrud(tx).createUserIfNotExists({ address: parsedMessage.address });
        const tokenAndSession = await moduleConfig.crud.getSessionCrud(tx).createAuthenticationSession(user.address);

        return tokenAndSession;
      });
    },

  };
}
