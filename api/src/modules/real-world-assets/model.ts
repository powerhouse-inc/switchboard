import type { Prisma } from '@prisma/client';
import { transformPortfolioToState } from './utils';

export function getRWACRUD(prisma: Prisma.TransactionClient) {
  return {
    findRWAPortfolios: async (where?: Prisma.RWAPortfolioWhereInput) => {
      const newWhere: Prisma.RWAPortfolioWhereInput = {
        ...where
      }

      try {
        const portfolios = await prisma.rWAPortfolio.findMany({
          include: {
            spvs: {
              include: { spv: true }
            },
            feeTypes: true,
            fixedIncomeTypes: true,
            accounts: true,
            portfolio: {
              include: {
                fixedIncomeType: true,
              },
              where: {}
            }
          }
        })
        return transformPortfolioToState(portfolios)
      } catch (e) {
        console.error(e)
        return [];
      }
    },
  };
}
