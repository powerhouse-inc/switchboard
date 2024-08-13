import { inputObjectType, objectType } from 'nexus';
import { documentModelInterface } from '../document';

export const AccountSnapshotState = objectType({
  name: 'AccountSnapshotState',
  definition(t) {
    t.nonNull.id('id');
    t.id('ownerId');
    t.string('ownerType');
    t.string('period');
    t.string('start');
    t.string('end');
    t.list.field('actualsComparison', { type: ActualsComparison });
    t.list.field('snapshotAccount', { type: SnapshotAccount });
  }
});
export const ActualsComparison = objectType({
  name: 'ActualsComparison',
  definition(t) {
    t.string('currency');
    t.string('month');
    t.float('reportedActuals');
    t.field('netExpenses', { type: ActualsComparisonNetExpenses });
  }
});
export const ActualsComparisonNetExpenses = objectType({
  name: 'ActualsComparisonNetExpenses',
  definition(t) {
    t.field('offChainIncluded', { type: ActualsComparisonNetExpensesItem });
    t.nonNull.field('onChainOnly', { type: ActualsComparisonNetExpensesItem });
  }
});
export const ActualsComparisonNetExpensesItem = objectType({
  name: 'ActualsComparisonNetExpensesItem',
  definition(t) {
    t.float('amount');
    t.float('difference');
  }
});
export const SnapshotAccount = objectType({
  name: 'SnapshotAccount',
  definition(t) {
    t.string('accountAddress');
    t.string('accountLabel');
    t.string('accountType');
    t.id('groupAccountId');
    t.nonNull.id('id');
    t.boolean('offChain');
    t.id('upstreamAccountId');
    t.list.field('snapshotAccountBalance', { type: SnapshotAccountBalance });
    t.list.field('snapshotAccountTransaction', {
      type: SnapshotAccountTransaction
    });
  }
});
export const SnapshotAccountBalance = objectType({
  name: 'SnapshotAccountBalance',
  definition(t) {
    t.id('id');
    t.boolean('includesOffChain');
    t.float('inflow');
    t.float('initialBalance');
    t.float('newBalance');
    t.float('outflow');
    t.string('token');
  }
});
export const SnapshotAccountTransaction = objectType({
  name: 'SnapshotAccountTransaction',
  definition(t) {
    t.float('amount');
    t.int('block');
    t.string('counterParty');
    t.string('counterPartyName');
    t.nonNull.id('id');
    t.string('timestamp');
    t.string('token');
    t.string('txHash');
    t.string('txLabel');
  }
});

export const SetEndInput = inputObjectType({
  name: 'SetEndInput',
  definition(t) {
    t.nonNull.string('end');
  }
});
export const SetIdInput = inputObjectType({
  name: 'SetIdInput',
  definition(t) {
    t.nonNull.id('id');
  }
});
export const SetOwnerIdInput = inputObjectType({
  name: 'SetOwnerIdInput',
  definition(t) {
    t.nonNull.id('ownerId');
  }
});
export const SetOwnerTypeInput = inputObjectType({
  name: 'SetOwnerTypeInput',
  definition(t) {
    t.nonNull.string('ownerType');
  }
});
export const SetPeriodInput = inputObjectType({
  name: 'SetPeriodInput',
  definition(t) {
    t.nonNull.string('period');
  }
});
export const SetStartInput = inputObjectType({
  name: 'SetStartInput',
  definition(t) {
    t.nonNull.string('start');
  }
});

export const AccountSnapshotDocument = objectType({
  name: 'AccountSnapshot',
  definition(t) {
    t.implements(documentModelInterface);
    t.nonNull.field('state', { type: AccountSnapshotState });
  }
});
