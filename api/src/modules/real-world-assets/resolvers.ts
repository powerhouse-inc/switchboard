import { nonNull, objectType, queryField, unionType } from 'nexus';
import { documentModelInterface } from '../document';
import { GQLDateBase } from '../system';

export const Account = objectType({
  name: 'Account',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('reference');
    t.string('label');
  },
});

// TODO: union type doesnt allow enums :-(
// export const CashGroupTransactionType = enumType({
//   name: 'CashGroupTransactionType',
//   members: ['PrincipalDraw', 'PrincipalReturn'],
// });

// export const FixedIncomeGroupTransactionType = enumType({
//   name: 'FixedIncomeGroupTransactionType',
//   members: ['AssetPurchase', 'AssetSale', 'InterestDraw', 'InterestReturn', 'FeesPayment'],
// });

// export const GroupTransactionType = unionType({
//   name: 'GroupTransactionType',
//   definition(t) {
//     t.members(
//       CashGroupTransactionType,
//       FixedIncomeGroupTransactionType,
//     );
//   },
//   resolveType: () => true,
// });

// export const GroupTransactionType = objectType({
//   name: 'GroupTransactionType',
//   definition(t) {
//     t.string('name');
//   },
// });

export const BaseTransaction = objectType({
  name: 'BaseTransaction',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.id('assetId');
    t.nonNull.float('amount');
    t.nonNull.field('entryTime', { type: GQLDateBase });
    t.field('tradeTime', { type: GQLDateBase });
    t.field('settlementTime', { type: GQLDateBase });
    t.string('txRef');
    t.id('accountId');
    t.id('counterPartyAccountId');
  },
});

export const AssetPurchaseGroupTransaction = objectType({
  name: 'AssetPurchaseGroupTransaction',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.field('type', { type: 'String' });
    t.field('cashTransaction', { type: BaseTransaction });
    t.field('fixedIncomeTransaction', { type: BaseTransaction });
    t.list.field('feeTransactions', { type: BaseTransaction });
  },
});
export const AssetSaleGroupTransaction = objectType({
  name: 'AssetSaleGroupTransaction',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.field('type', { type: 'String' });
    t.field('cashTransaction', { type: BaseTransaction });
    t.field('fixedIncomeTransaction', { type: BaseTransaction });
    t.list.field('feeTransactions', { type: BaseTransaction });
  },
});

export const Cash = objectType({
  name: 'Cash',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.id('spvId');
    t.nonNull.string('currency');
  },
});
export const FeesPaymentGroupTransaction = objectType({
  name: 'FeesPaymentGroupTransaction',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.field('type', { type: 'String' });
    t.list.field('feeTransactions', { type: BaseTransaction });
  },
});
export const FixedIncome = objectType({
  name: 'FixedIncome',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.id('fixedIncomeTypeId');
    t.nonNull.string('name');
    t.nonNull.id('spvId');
    t.nonNull.field('maturity', { type: GQLDateBase });
    t.nonNull.field('purchaseDate', { type: GQLDateBase });
    t.nonNull.float('notional');
    t.nonNull.float('purchasePrice');
    t.nonNull.float('purchaseProceeds');
    t.nonNull.float('totalDiscount');
    t.nonNull.float('marketValue');
    t.nonNull.float('annualizedYield');
    t.nonNull.float('realizedSurplus');
    t.nonNull.float('totalSurplus');
    t.string('ISIN');
    t.string('CUSIP');
    t.float('coupon');
    t.float('currentValue');
  },
});
export const FixedIncomeType = objectType({
  name: 'FixedIncomeType',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('name');
  },
});
export const InterestDrawGroupTransaction = objectType({
  name: 'InterestDrawGroupTransaction',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.field('type', { type: 'String' });
    t.field('interestTransaction', { type: BaseTransaction });
  },
});
export const InterestReturnGroupTransaction = objectType({
  name: 'InterestReturnGroupTransaction',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.field('type', { type: 'String' });
    t.field('interestTransaction', { type: BaseTransaction });
  },
});
export const PrincipalDrawGroupTransaction = objectType({
  name: 'PrincipalDrawGroupTransaction',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.field('type', { type: 'String' });
    t.field('cashTransaction', { type: BaseTransaction });
    t.list.field('feeTransactions', { type: BaseTransaction });
  },
});
export const PrincipalReturnGroupTransaction = objectType({
  name: 'PrincipalReturnGroupTransaction',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.field('type', { type: 'String' });
    t.field('cashTransaction', { type: BaseTransaction });
    t.list.field('feeTransactions', { type: BaseTransaction });
  },
});

export const Spv = objectType({
  name: 'Spv',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('name');
  },
});

export const ServiceProvider = objectType({
  name: 'ServiceProvider',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('name');
    t.nonNull.string('feeType');
    t.nonNull.id('accountId');
  },
});

export const Asset = unionType({
  name: 'Asset',
  definition(t) {
    t.members(FixedIncome, Cash);
  },
  resolveType: (e) => {
    if (e.currency) {
      return "Cash"
    }
    return "FixedIncome";
  },
});

export const GroupTransaction = unionType({
  name: 'GroupTransaction',
  definition(t) {
    t.members(
      PrincipalDrawGroupTransaction,
      PrincipalReturnGroupTransaction,
      AssetPurchaseGroupTransaction,
      AssetSaleGroupTransaction,
      InterestDrawGroupTransaction,
      InterestReturnGroupTransaction,
      FeesPaymentGroupTransaction,
    );
  },
  resolveType: (e) => {
    if (e.type === "FeesPayment") {
      return "FeesPaymentGroupTransaction"
    }

    if (e.type === "AssetPurchase") {
      return "AssetPurchaseGroupTransaction"
    }

    return true;
  },
});

export const RealWorldAssetsState = objectType({
  name: 'RealWorldAssetsState',
  definition(t) {
    t.nonNull.list.nonNull.field('accounts', { type: Account });
    t.nonNull.id('principalLenderAccountId');
    t.nonNull.list.nonNull.field('spvs', { type: Spv });
    t.nonNull.list.nonNull.field('feeTypes', { type: ServiceProvider });
    t.nonNull.list.nonNull.field('fixedIncomeTypes', { type: FixedIncomeType });
    t.nonNull.list.nonNull.field('portfolio', { type: Asset });
    t.nonNull.list.nonNull.field('transactions', { type: GroupTransaction });
  },
});

export const RealWorldAssetsDocument = objectType({
  name: 'RWAPortfolio',
  definition(t) {
    t.implements(documentModelInterface);
    t.nonNull.field('state', { type: RealWorldAssetsState });
  },
});

export const TransactionFee = objectType({
  name: 'TransactionFee',
  definition(t) {
    t.nonNull.id('serviceProviderId');
    t.nonNull.float('amount');
  },
});

export const rwaQuery = queryField('rwaPortfolio', {
  type: RealWorldAssetsDocument,
  args: {
    id: nonNull('String'),
  },
  resolve: async (_root, { id }, ctx) => {
    const doc = await ctx.prisma.document.getDocument(ctx.driveId, id);

    return doc;
  },
});
