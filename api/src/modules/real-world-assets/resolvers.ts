import {
  enumType,
  interfaceType,
  list,
  objectType,
  queryField,
  stringArg,
  unionType
} from 'nexus';
import { getChildLogger } from '../../logger';
import { documentModelInterface } from '../document';
import { GQLDateBase } from '../system';

const logger = getChildLogger({ msgPrefix: 'REAL WORLD ASSETS RESOLVER' });

export const Account = objectType({
  name: 'Account',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('reference');
    t.string('label');
  }
});
export const BaseTransaction = objectType({
  name: 'BaseTransaction',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.field('assetType', { type: AssetType });
    t.nonNull.id('assetId');
    t.nonNull.float('amount');
    t.nonNull.field('entryTime', { type: GQLDateBase });
    t.field('tradeTime', { type: GQLDateBase });
    t.field('settlementTime', { type: GQLDateBase });
    t.id('accountId');
    t.id('counterPartyAccountId');
  }
});
export const Cash = objectType({
  name: 'Cash',
  definition(t) {
    t.nonNull.id('id');
    t.id('spvId');
    t.field('spv', { type: Spv });
    t.nonNull.string('currency');
    t.nonNull.float('balance');
  }
});

export const FixedIncomeType = objectType({
  name: 'FixedIncomeType',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('name');
  }
});

export const AssetType = enumType({
  name: 'AssetType',
  members: ['Cash', 'FixedIncome']
});

export const Spv = objectType({
  name: 'Spv',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('name');
  }
});

export const FixedIncome = objectType({
  name: 'FixedIncome',
  definition(t) {
    t.id('id');
    t.nonNull.field('type', { type: AssetType });
    t.id('fixedIncomeTypeId');
    t.field('fixedIncomeType', { type: FixedIncomeType });
    t.string('name');
    t.id('spvId');
    t.field('spv', { type: Spv });
    t.field('purchaseDate', { type: GQLDateBase });
    t.float('notional');
    t.float('assetProceeds');
    t.float('purchaseProceeds');
    t.float('salesProceeds');
    t.float('purchasePrice');
    t.float('totalDiscount');
    t.float('realizedSurplus');
    t.field('maturity', { type: GQLDateBase });
    t.string('ISIN');
    t.string('CUSIP');
    t.float('coupon');
  }
});

export const GroupTransaction = objectType({
  name: 'GroupTransaction',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.field('type', { type: GroupTransactionType });
    t.nonNull.field('entryTime', { type: GQLDateBase });
    t.nonNull.float('cashBalanceChange');
    t.float('unitPrice');
    t.list.nonNull.field('fees', { type: TransactionFee });
    t.nonNull.field('cashTransaction', { type: BaseTransaction });
    t.field('fixedIncomeTransaction', { type: BaseTransaction });
    t.id('serviceProviderFeeTypeId');
    t.string('txRef');
  }
});

export const RealWorldAssetsStateInterface = interfaceType({
  name: 'IRealWorldAssetsState',
  definition(t) {
    t.nonNull.list.nonNull.field('accounts', { type: Account });
    t.nonNull.id('principalLenderAccountId');
    t.nonNull.list.nonNull.field('spvs', { type: Spv });
    t.nonNull.list.nonNull.field('serviceProviderFeeTypes', {
      type: ServiceProviderFeeType
    });
    t.nonNull.list.nonNull.field('fixedIncomeTypes', { type: FixedIncomeType });
    t.nonNull.list.nonNull.field('portfolio', { type: Asset });
    t.nonNull.list.nonNull.field('transactions', { type: GroupTransaction });
  },
  resolveType: () => 'RealWorldAssetsState'
});

export const RealWorldAssetsState = objectType({
  name: 'RealWorldAssetsState',
  definition(t) {
    t.implements(RealWorldAssetsStateInterface);
  }
});

export const ServiceProviderFeeType = objectType({
  name: 'ServiceProviderFeeType',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('name');
    t.nonNull.string('feeType');
    t.nonNull.id('accountId');
  }
});

export const TransactionFee = objectType({
  name: 'TransactionFee',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.id('serviceProviderFeeTypeId');
    t.nonNull.float('amount');
  }
});

export const Asset = unionType({
  name: 'Asset',
  definition(t) {
    t.members(FixedIncome, Cash);
  },
  resolveType: (asset: any) => {
    if (asset.name) {
      return 'FixedIncome';
    }

    return 'Cash';
  }
});

export const GroupTransactionType = enumType({
  name: 'GroupTransactionType',
  members: [
    'PrincipalDraw',
    'PrincipalReturn',
    'AssetPurchase',
    'AssetSale',
    'InterestIncome',
    'InterestPayment',
    'FeesIncome',
    'FeesPayment'
  ]
});

export const RealWorldAssetsPortfolio = objectType({
  name: 'RealWorldAssetsPortfolio',
  definition(t) {
    t.nonNull.id('id');
    t.implements(RealWorldAssetsStateInterface);
  }
});

export const RealWorldAssetsDocument = objectType({
  name: 'RealWorldAssets',
  definition(t) {
    t.implements(documentModelInterface);
    t.nonNull.field('state', { type: RealWorldAssetsState });
  }
});

export const rwaQuery = queryField('rwaPortfolios', {
  type: list(RealWorldAssetsPortfolio),
  args: {
    id: stringArg()
  },
  resolve: async (_root, { id }, ctx) => {
    logger.info('Fetching RWA portfolios');
    const docs = await ctx.prisma.rWAPortfolio.findRWAPortfolios({
      driveId: ctx.driveId
    });
    if (id) {
      return docs.filter(e => e.id === id);
    }

    return docs as any[];
  }
});
