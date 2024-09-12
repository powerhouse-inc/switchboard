/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  enumType,
  list,
  objectType,
  queryField,
  scalarType,
  stringArg,
  unionType
} from 'nexus';

import { utils } from 'document-model-libs/real-world-assets';
import { getChildLogger } from '../../logger';
import { documentModelInterface } from '../document/resolvers';

export const logger = getChildLogger({
  msgPrefix: 'REAL WORLD ASSETS RESOLVER'
});

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
    t.nonNull.field('entryTime', { type: DateTime });
    t.field('tradeTime', { type: DateTime });
    t.field('settlementTime', { type: DateTime });
    t.id('accountId');
    t.id('counterPartyAccountId');
  }
});
export const Cash = objectType({
  name: 'Cash',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.field('type', { type: AssetType });
    t.nonNull.id('spvId');
    t.nonNull.string('currency');
    t.nonNull.float('balance');
  }
});
export const FixedIncome = objectType({
  name: 'FixedIncome',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.field('type', { type: AssetType });
    t.nonNull.id('fixedIncomeTypeId');
    t.nonNull.string('name');
    t.nonNull.id('spvId');
    t.nonNull.field('purchaseDate', { type: DateTime });
    t.nonNull.float('notional');
    t.nonNull.float('assetProceeds');
    t.nonNull.float('purchaseProceeds');
    t.nonNull.float('salesProceeds');
    t.nonNull.float('purchasePrice');
    t.nonNull.float('totalDiscount');
    t.nonNull.float('realizedSurplus');
    t.field('maturity', { type: DateTime });
    t.string('ISIN');
    t.string('CUSIP');
    t.float('coupon');
  }
});
export const FixedIncomeType = objectType({
  name: 'FixedIncomeType',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('name');
  }
});
export const GroupTransaction = objectType({
  name: 'GroupTransaction',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.field('type', { type: GroupTransactionType });
    t.nonNull.field('entryTime', { type: DateTime });
    t.nonNull.float('cashBalanceChange');
    t.float('unitPrice');
    t.list.nonNull.field('fees', { type: TransactionFee });
    t.nonNull.field('cashTransaction', { type: BaseTransaction });
    t.field('fixedIncomeTransaction', { type: BaseTransaction });
    t.id('serviceProviderFeeTypeId');
    t.string('txRef');
  }
});
export const RealWorldAssetsState = objectType({
  name: 'RealWorldAssetsState',
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
export const Spv = objectType({
  name: 'Spv',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('name');
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
  resolveType: t => t.type
});

export const AssetType = enumType({
  name: 'AssetType',
  members: ['Cash', 'FixedIncome']
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

export const DateTime = scalarType({
  name: 'DateTime',
  serialize(value) {
    const date = utils.dateValidator.safeParse(value);
    return date.data?.toISOString() || '';
  },
  parseValue(value) {
    return utils.dateValidator.safeParse(value).data || '';
  }
});

export const RealWorldAssetsDocument = objectType({
  name: 'RealWorldAssets',
  definition(t) {
    t.implements(documentModelInterface);
    t.nonNull.field('state', { type: RealWorldAssetsState });
    t.nonNull.field('initialState', { type: RealWorldAssetsState });
  }
});

export const rwaQuery = queryField('rwaPortfolios', {
  type: list(RealWorldAssetsDocument),
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
