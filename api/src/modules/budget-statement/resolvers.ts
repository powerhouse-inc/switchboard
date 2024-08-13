import { enumType, objectType } from 'nexus';
import { documentModelInterface } from '../document';
import { GQLAttachmentBase, GQLDateBase } from '../system';
export const Account = objectType({
  name: 'BudgetStatementAccount',
  definition(t) {
    t.nonNull.string('address');
    t.nonNull.string('name');
    t.nonNull.list.nonNull.field('lineItems', { type: LineItem });
  }
});
export const AuditReport = objectType({
  name: 'AuditReport',
  definition(t) {
    t.nonNull.field('timestamp', { type: GQLDateBase });
    t.nonNull.field('report', { type: GQLAttachmentBase });
    t.nonNull.field('status', { type: AuditReportStatus });
  }
});

export const BudgetStatementState = objectType({
  name: 'BudgetStatementState',
  definition(t) {
    t.field('owner', { type: Owner });
    t.string('month');
    t.string('quoteCurrency');
    t.nonNull.list.nonNull.field('accounts', { type: Account });
    t.nonNull.list.nonNull.field('vesting', { type: Vesting });
    t.field('ftes', { type: Ftes });
    t.nonNull.list.nonNull.field('auditReports', { type: AuditReport });
    t.nonNull.list.nonNull.field('comments', { type: Comment });
  }
});
export const Comment = objectType({
  name: 'Comment',
  definition(t) {
    t.nonNull.string('key');
    t.nonNull.field('author', { type: CommentAuthor });
    t.nonNull.string('comment');
    t.nonNull.field('timestamp', { type: GQLDateBase });
    t.nonNull.field('status', { type: BudgetStatus });
  }
});
export const CommentAuthor = objectType({
  name: 'CommentAuthor',
  definition(t) {
    t.string('ref');
    t.string('id');
    t.string('username');
    t.string('roleLabel');
  }
});
export const Ftes = objectType({
  name: 'Ftes',
  definition(t) {
    t.nonNull.float('value');
    t.nonNull.list.nonNull.field('forecast', { type: FtesForecast });
  }
});
export const FtesForecast = objectType({
  name: 'FtesForecast',
  definition(t) {
    t.nonNull.string('month');
    t.nonNull.float('value');
  }
});
export const LineItem = objectType({
  name: 'LineItem',
  definition(t) {
    t.field('group', { type: LineItemGroup });
    t.nonNull.boolean('headcountExpense');
    t.field('category', { type: LineItemCategory });
    t.float('budgetCap');
    t.float('actual');
    t.float('payment');
    t.nonNull.list.nonNull.field('forecast', { type: LineItemForecast });
    t.string('comment');
  }
});
export const LineItemCategory = objectType({
  name: 'LineItemCategory',
  definition(t) {
    t.nonNull.string('ref');
    t.nonNull.string('id');
    t.nonNull.string('title');
  }
});
export const LineItemForecast = objectType({
  name: 'LineItemForecast',
  definition(t) {
    t.nonNull.string('month');
    t.nonNull.float('value');
    t.nonNull.float('budgetCap');
  }
});
export const LineItemGroup = objectType({
  name: 'LineItemGroup',
  definition(t) {
    t.nonNull.string('ref');
    t.nonNull.string('id');
    t.nonNull.string('title');
    t.nonNull.string('color');
  }
});
export const Owner = objectType({
  name: 'Owner',
  definition(t) {
    t.string('ref');
    t.string('id');
    t.string('title');
  }
});
export const Vesting = objectType({
  name: 'Vesting',
  definition(t) {
    t.nonNull.string('key');
    t.nonNull.string('date');
    t.nonNull.string('amount');
    t.nonNull.string('amountOld');
    t.nonNull.string('comment');
    t.nonNull.string('currency');
    t.nonNull.boolean('vested');
  }
});

export const AuditReportStatus = enumType({
  name: 'AuditReportStatus',
  members: ['Approved', 'ApprovedWithComments', 'NeedsAction', 'Escalated']
});
export const BudgetStatus = enumType({
  name: 'BudgetStatus',
  members: ['Draft', 'Review', 'Final', 'Escalated']
});

export const BudgetStatementDocument = objectType({
  name: 'BudgetStatement',
  definition(t) {
    t.implements(documentModelInterface);
    t.nonNull.field('state', { type: BudgetStatementState });
  }
});
