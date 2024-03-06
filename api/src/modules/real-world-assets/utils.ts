export function transformPortfolioToState(portfolios) {
    return portfolios.map(portfolio => ({
        id: portfolio.id,
        name: portfolio.name,
        // spvs: [],
        spvs: portfolio.spvs.map(spv => ({
            id: spv.spv.id,
            name: spv.spv.name
        })),
        feeTypes: portfolio.feeTypes.map(feeType => ({
            id: feeType.id,
            name: feeType.name
        })),
        portfolio: portfolio.portfolio.map(asset => ({
            id: asset.id,
            purchasePrice: asset.purchasePrice,
            purchaseDate: asset.purchaseDate,
            name: asset.name,
            fixedIncomeType: {
                id: asset.fixedIncomeType.id,
                name: asset.fixedIncomeType.name
            }
        })),
        // fixedIncomeTypes: portfolio.fixedIncomeTypes.map(fixedIncomeType => ({
        //     id: fixedIncomeType.id,
        //     name: fixedIncomeType.name
        // })),
        // accounts: portfolio.accounts.map(account => ({
        //     id: account.id,
        //     name: account.name
        // }))
    }));
}
