import { Prisma, RWAPortfolio } from "@prisma/client";

export function transformPortfolioToState(portfolios: Prisma.RWAPortfolioGetPayload<{
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
                fees: true,
            }
        },
        RWAPortfolioServiceProviderFeeType: true
    }
}>[]) {
    return portfolios.map(portfolio => ({
        // id: portfolio.documentId,
        principalLenderAccountId: portfolio.principalLenderAccountId,
    }))
}
