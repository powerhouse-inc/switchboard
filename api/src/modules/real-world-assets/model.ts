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
                        accounts: {
                            include: {
                                account: true
                            }
                        },
                        feeTypes: {
                            include: {
                                spv: true
                            }
                        },
                        fixedIncomeTypes: {
                            include: {
                                fixedIncome: true
                            }
                        },
                        portfolio: {
                            include: {
                                fixedIncomeType: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                }
                            }
                        },
                        spvs: {
                            include: {
                                spv: true
                            }
                        },
                        RWAGroupTransaction: {
                            include: {
                                cashTransaction: true,
                                feeTransactions: {
                                    include: {
                                        baseTransaction: true
                                    }
                                },
                                fixedIncomeTransaction: true,
                                interestTransaction: true,
                                fees: true,
                            }
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
