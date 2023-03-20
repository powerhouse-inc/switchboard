import { PrismaClient } from '@prisma/client';
import { userCrud } from './modules';

let prisma: PrismaClient;

const mapCrudIntoContext = (
  crud: Record<string, (p: PrismaClient) => Function>,
  prismaInstance: PrismaClient,
) => Object.fromEntries(
  Object.entries(crud).map(([key, value]) => [key, value(prismaInstance)]),
);

export const getPrisma = () => {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: 'file:./db.sqlite',
        },
      },
    });
  }
  const xprisma = prisma.$extends({
    model: {
      user: {
        ...mapCrudIntoContext(userCrud, prisma),
      },
    },
  });
  return xprisma;
};
