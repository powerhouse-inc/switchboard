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
        }
    }
}>[]) {
    return portfolios.map(portfolio => ({
        id: portfolio.id,
        // spvs: [],
        spvs: portfolio.spvs.map(spv => ({
            id: spv.spv.id,
            name: spv.spv.name
        })),
        feeTypes: portfolio.feeTypes.map(feeType => ({
            id: feeType.spv.id,
            name: feeType.spv.name
        })),
        portfolio: portfolio.portfolio.map(asset => ({
            id: asset.id,
            purchasePrice: asset.purchasePrice,
            purchaseDate: asset.purchaseDate,
            name: asset.name,
            fixedIncomeType: {
                id: asset.fixedIncomeType?.id,
                name: asset.fixedIncomeType?.name
            }
        })),
        fixedIncomeTypes: portfolio.fixedIncomeTypes.map(fixedIncomeType => ({
            id: fixedIncomeType.fixedIncome.id,
            name: fixedIncomeType.fixedIncome.name
        })),
        accounts: portfolio.accounts.map(account => ({
            id: account.account.id,
            name: account.account.label
        }))
    }));
}
