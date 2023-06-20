import type { PrismaClient } from '@prisma/client';
import { SiweMessage } from 'siwe';
import { objectType } from 'nexus/dist';
import { GraphQLError } from 'graphql';
import url from 'url';
import { randomUUID } from 'crypto';

export const Challenge = objectType({
  name: 'Challenge',
  definition(t) {
    t.nonNull.string('nonce');
    t.nonNull.string('address');
    t.nonNull.string('message');
  },
});

const parseMessage = (message: string) => {
  try {
    return new SiweMessage(message);
  } catch (error) {
    console.error('Provided message has invalid format', error);
    throw new GraphQLError('Provided message has invalid format');
  }
};

export function getChallengeCrud(prisma: PrismaClient) {
  return {

    async createChallenge(origin: string | undefined, address: string) {
      const domain = origin ? url.parse(origin).hostname : undefined;
      if (!domain) {
        throw new GraphQLError('Origin is missing', { extensions: { code: 'ORIGIN_NOT_FOUND' } });
      }
      const nonce = randomUUID().replace(/-/g, '');
      const message = new SiweMessage({
        address,
        nonce,
        uri: origin,
        domain,
        version: '1',
        chainId: 1,
      }).prepareMessage();
      const challenge = {
        nonce,
        message,
      };
      await prisma.challenge.create({
        data: challenge,
      });
      return challenge;
    },

    async solveChallenge(origin: string | undefined, nonce: string, signature: string) {
      const domain = origin ? url.parse(origin).hostname : undefined;
      if (!domain) {
        throw new GraphQLError('Origin is missing', { extensions: { code: 'ORIGIN_NOT_FOUND' } });
      }

      const challange = await prisma.challenge.findFirst({
        where: {
          nonce: {
            equals: nonce,
          },
        },
      });

      console.log('solveChallenge', challange, origin, nonce, signature);
      // check that challange with this nonce exists
      if (!challange) {
        throw new GraphQLError('The nonce is not known');
      }

      const parsedMessage = parseMessage(challange.message);
      console.log('parsedMessage', parsedMessage);

      try {
        await parsedMessage.verify({
          domain,
          nonce,
          time: new Date().toISOString(),
          signature,
        });
      } catch (error) {
        console.error('Invalid signature', error, nonce, signature);
        throw new GraphQLError('Invalid signature');
      }
      // await createUserIfNotExists(prisma, userId);
      // return generateTokenAndSession(prisma, userId, { ...session, id: pendingAuth.id }, isUserCreated);
    },

  };
}
