import { arg, enumType, interfaceType, list, objectType, queryField, stringArg, unionType } from 'nexus';
import { GQLDateBase } from '../system';
import { documentModelInterface } from '../document';
import { getChildLogger } from '../../logger';
import { string } from 'zod';

const logger = getChildLogger({ msgPrefix: 'REAL WORLD ASSETS RESOLVER' });

export const Account = objectType({
  name: "Account",
  definition(t) {
    t.nonNull.id("id")
    t.nonNull.string("reference")
    t.string("label")
  }
})
export const BaseTransaction = objectType({
  name: "BaseTransaction",
  definition(t) {
    t.nonNull.id("id")
    t.nonNull.id("assetId")
    t.nonNull.float("amount")
    t.nonNull.field("entryTime", { type: GQLDateBase })
    t.field("tradeTime", { type: GQLDateBase })
    t.field("settlementTime", { type: GQLDateBase })
    t.string("txRef")
    t.id("accountId")
    t.id("counterPartyAccountId")
  }
})
export const Cash = objectType({
  name: "Cash",
  definition(t) {
    t.nonNull.id("id")
    t.id("spvId")
    t.field("spv", { type: Spv })
    t.nonNull.string("currency")
    t.nonNull.float("balance")
  }
})
export const FixedIncome = objectType({
  name: "FixedIncome",
  definition(t) {
    t.nonNull.id("id")
    t.nonNull.id("fixedIncomeTypeId")
    t.nonNull.field("fixedIncomeType", { type: FixedIncomeType })
    t.nonNull.string("name")
    t.id("spvId")
    t.field("spv", { type: Spv })
    t.nonNull.field("maturity", { type: GQLDateBase })
    t.nonNull.field("purchaseDate", { type: GQLDateBase })
    t.nonNull.float("notional")
    t.nonNull.float("purchasePrice")
    t.nonNull.float("purchaseProceeds")
    t.nonNull.float("totalDiscount")
    t.nonNull.float("annualizedYield")
    t.nonNull.float("realizedSurplus")
    t.string("ISIN")
    t.string("CUSIP")
    t.float("coupon")
    t.float("salesProceeds")
  }
})
export const FixedIncomeType = objectType({
  name: "FixedIncomeType",
  definition(t) {
    t.nonNull.id("id")
    t.nonNull.string("name")
  }
})
export const GroupTransaction = objectType({
  name: "GroupTransaction",
  definition(t) {
    t.nonNull.id("id")
    t.nonNull.field("type", { type: GroupTransactionType })
    t.nonNull.field("entryTime", { type: GQLDateBase })
    t.nonNull.float("cashBalanceChange")
    t.list.nonNull.field("fees", { type: TransactionFee })
    t.field("cashTransaction", { type: BaseTransaction })
    t.field("fixedIncomeTransaction", { type: BaseTransaction })
    t.list.nonNull.field("feeTransactions", { type: BaseTransaction })
    t.field("interestTransaction", { type: BaseTransaction })
  }
})
export const RealWorldAssetsStateInterface = interfaceType({
  name: "IRealWorldAssetsState",
  definition(t) {
    t.nonNull.list.nonNull.field("accounts", { type: Account })
    t.nonNull.id("principalLenderAccountId")
    t.nonNull.list.nonNull.field("spvs", { type: Spv })
    t.nonNull.list.nonNull.field("serviceProviderFeeTypes", { type: ServiceProviderFeeType })
    t.nonNull.list.nonNull.field("fixedIncomeTypes", { type: FixedIncomeType })
    t.nonNull.list.nonNull.field("portfolio", { type: AssetUnion })
    t.nonNull.list.nonNull.field("transactions", { type: GroupTransaction })
  }, resolveType: () => "RealWorldAssetsState"
})

export const RealWorldAssetsState = objectType({
  name: "RealWorldAssetsState",
  definition(t) {
    t.implements(RealWorldAssetsStateInterface)
  }
})

export const ServiceProviderFeeType = objectType({
  name: "ServiceProviderFeeType",
  definition(t) {
    t.nonNull.id("id")
    t.nonNull.string("name")
    t.nonNull.string("feeType")
    t.nonNull.id("accountId")
  }
})
export const Spv = objectType({
  name: "Spv",
  definition(t) {
    t.nonNull.id("id")
    t.nonNull.string("name")
  }
})
export const TransactionFee = objectType({
  name: "TransactionFee",
  definition(t) {
    t.nonNull.id("id")
    t.nonNull.id("serviceProviderFeeTypeId")
    t.nonNull.float("amount")
  }
})

export const AssetUnion = unionType({
  name: "Asset",
  definition(t) {
    t.members(FixedIncome, Cash)
  },
  resolveType: (asset) => {
    if (asset.name) {
      return "FixedIncome";
    }

    return "Cash"
  }
});

export const GroupTransactionType = enumType({
  name: "GroupTransactionType",
  members: ['AssetPurchase', 'AssetSale', 'InterestDraw', 'InterestReturn', 'FeesPayment', 'PrincipalDraw', 'PrincipalReturn', 'InterestPayment'],
});

export const RealWorldAssetsPortfolio = objectType({
  name: "RealWorldAssetsPortfolio",
  definition(t) {
    t.nonNull.id("id")
    t.implements(RealWorldAssetsStateInterface)
  }
})

export const RealWorldAssetsDocument = objectType({
  name: 'RealWorldAssets',
  definition(t) {
    t.implements(documentModelInterface);
    t.nonNull.field('state', { type: RealWorldAssetsState });
  },
});

export const rwaQuery = queryField('rwaPortfolios', {
  type: list(RealWorldAssetsPortfolio),
  args: {
    id: stringArg(),
  },
  resolve: async (_root, { id }, ctx) => {
    try {
      const docs = await ctx.prisma.rWAPortfolio.findRWAPortfolios({ driveId: ctx.driveId });
      if (id) {
        return docs.filter(e => e.id === id);
      }

      return docs;
    } catch (e: any) {
      logger.error({ msg: e.message });
    }
  },
});

