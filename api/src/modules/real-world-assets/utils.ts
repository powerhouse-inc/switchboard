import { Prisma } from '@prisma/client';
import { RealWorldAssetsDocument, utils } from 'document-model-libs/real-world-assets';

export function transformPortfolioToState(
  portfolios: Prisma.RWAPortfolioGetPayload<{
    include: {
      accounts: {
        include: {
          account: true;
        };
      };
      feeTypes: {
        include: {
          spv: true;
        };
      };
      fixedIncomeTypes: {
        include: {
          fixedIncome: true;
        };
      };
      portfolio: {
        include: {
          fixedIncomeType: {
            select: {
              id: true;
              name: true;
            };
          };
        };
      };
      spvs: {
        include: {
          spv: true;
        };
      };
      RWAGroupTransaction: {
        include: {
          cashTransaction: true;
          feeTransactions: {
            include: {
              baseTransaction: true;
            };
          };
          fixedIncomeTransaction: true;
          fees: true;
        };
      };
      RWAPortfolioServiceProviderFeeType: true;
    };
  }>[]
) {
  return portfolios.map(portfolio => ({
    id: portfolio.documentId,
    principalLenderAccountId: portfolio.principalLenderAccountId,
    spvs: portfolio.spvs.map(spv => ({
      id: spv.spv.id,
      name: spv.spv.name
    })),
    feeTypes: portfolio.feeTypes.map(feeType => ({
      id: feeType.spv.id,
      name: feeType.spv.name
    })),
    portfolio: portfolio.portfolio.map(asset => {
      const spv = portfolio.spvs
        .map(spv => ({
          id: spv.spv.id,
          name: spv.spv.name
        }))
        .find(e => e.id === asset.spvId);

      const fixedIncomeType = portfolio.fixedIncomeTypes
        .map(fixedIncomeType => ({
          id: fixedIncomeType.fixedIncome.id,
          name: fixedIncomeType.fixedIncome.name
        }))
        .find(e => e.id == asset.fixedIncomeTypeId);

      return {
        ...asset,
        id: asset.id,
        purchasePrice: asset.purchasePrice,
        purchaseDate: asset.purchaseDate,
        name: asset.name,
        salesProceeds: asset.salesProceeds,
        fixedIncomeType: fixedIncomeType,
        spv: spv,
        spvId: asset.spvId,
        fixedIncomeTypeId: asset.fixedIncomeTypeId
      };
    }),
    serviceProviderFeeTypes: portfolio.RWAPortfolioServiceProviderFeeType.map(
      serviceProviderFeeType => ({
        ...serviceProviderFeeType
      })
    ),
    fixedIncomeTypes: portfolio.fixedIncomeTypes.map(fixedIncomeType => ({
      id: fixedIncomeType.fixedIncome.id,
      name: fixedIncomeType.fixedIncome.name
    })),
    accounts: portfolio.accounts.map(account => ({
      ...account.account
    })),
    transactions: portfolio.RWAGroupTransaction.map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      cashTransaction: transaction.cashTransaction,
      entryTime: transaction.entryTime,
      cashBalanceChange: transaction.cashBalanceChange,
      fixedIncomeTransaction: transaction.fixedIncomeTransaction,
      fees: transaction.fees.map(fee => ({
        id: fee.id,
        serviceProviderFeeTypeId: fee.serviceProviderFeeTypeId,
        amount: fee.amount
      }))
    }))
  }));
}

export function buildRWADocument(document: RealWorldAssetsDocument): RealWorldAssetsDocument {
  const newDocument = utils.makeRwaDocumentWithAssetCurrentValues(document);
  return newDocument
}
