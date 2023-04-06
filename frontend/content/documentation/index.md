# README

@acaldas/document-model-libs / [Exports](#modules)

# Powerhouse Document Model

## Getting started

Install the library:

-   NPM: `npm install @acaldas/document-model-libs`
-   Yarn: `yarn add @acaldas/document-model-libs`

## Documentation

The full documentation for this package is available at: https://acaldas.github.io/document-model-libs/

There are two ways to interact with a document:

### Functional:

```javascript
import {
    actions,
    reducer,
    utils,
} from '@acaldas/document-model-libs/budget-statement';

let budgetStatement = utils.createBudgetStatement({
    name: 'March report',
    data: { month: '2023/01' },
});

budgetStatement = reducer(
    budgetStatement,
    actions.addAccount([{ address: 'eth:0x00' }])
);
```

### Object oriented:

```javascript
import { BudgetStatement } from '@acaldas/document-model-libs/budget-statement';

const budgetStatement = new BudgetStatement({
    name: 'march',
    data: { month: '2023/01' },
});
budgetStatement.addAccount([{ address: 'eth:0x00' }]);
```

## Architecture

This implementation is inspired by the [Flux architecture pattern](https://facebookarchive.github.io/flux/). All state changes are performed by a reducer, which is a pure function that enforces state transitions:

```javascript
const newState = reducer(state, action);
```

The business logic is implemented in pure functions, making it easy to test and integrate into different applications. The operations history is kept to allow reverting changes.

An action is a JSON object with the action name and payload:

```javascript
{
    type: 'SET_NAME';
    input: {
        name: 'March report';
    }
}
```

To make it easier to create actions and avoid bugs, an action creator is provided for each action. This is a function that accepts the action input and returns the JSON structure. For the case above the action creator would be:

```javascript
state = reducer(state, setName('March report'));
```

An Object-oriented version is also provided. A document can be instantiated and interacted in an imperative way:

```javascript
const document = new Document();
document.setName('March report');
```

## Base Document Model

All document models extend the Base Document model, which provides some common features. A document has the following structure:

```javascript
{
    name: "SES 2023-01 expense report", // name of the document
    documentType: "powerhouse/budget-statement", // type of the document model
    revision: 4, // number of operations applied to the document
    created: "2023-02-05 12:15:01", // date of creation of the document
    lastModified: "2023-02-05 12:15:01", // date of the last modification
    data: {} // specific state of the document, to be implemented by document models
}
```

### Base Document Actions

Document reducers are wrapped by the Base Document reducer, which is responsible for updating the document attributes described above and adds support for some base document features.

▸ For more information on Document actions, please refer to the [complete documentation](markdown/modules/Document.actions.md).

-   `SET_NAME`: Changes the name of the document

```javascript
setName(name: string);
```

-   `UNDO`: Cancels the last X operations. Defaults to 1.

```javascript
undo(count: number);
```

-   `REDO`: Cancels the last X UNDO operations. Defaults to 1.

```javascript
redo(count: number);
```

-   `PRUNE`: Joins multiple operations into a single `LOAD_STATE` operation. Useful to keep operations history smaller. Operations to prune are selected by index, similar to the [slice](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice) method in Arrays.

```javascript
prune(start?: number, end?: number);
```

## Budget Statement Model

A Budget statement follows the following data structure:

```javascript
{
    name: "SES January 2023",
    documentType: "powerhouse/budget-statement",
    revision: 10,
    created: "2023-02-21 10:15:26",
    lastModified: "2023-02-21 13:12:49",
    data: {
        owner: {
            ref: "makerdao/core-unit",
            id: "SES-001",
            title: "Sustainable Ecosystem Scaling"
        },
        month: "2023/01",
        status: "Draft" | "Review" | "Final" | "Escalated",
        quoteCurrency: "DAI",
        auditReports: [
            {
                timestamp: "2023-02-21 13:12:49",
                report: "attachment://audits/report.pdf",
                status: "Approved" | "ApprovedWithComments" | "NeedsAction" | "Escalated"
            }
        ],
        accounts: [
            {
                address: "eth:0xb5eB779cE300024EDB3dF9b6C007E312584f6F4f",
                name: "Grants Program",
                accountBalance: {
                    timestamp: "2023-02-21 11:22:09",
                    value: 4048.02
                },
                targetBalance: {
                    comment: "3 months of operational runway",
                    value: 5048.02
                },
                topupTransaction: {
                    id: "eth:0x3F23D0E301C458B095A02b12E3bC4c752a844eD9",
                    requestedValue: 1000,
                    value: 1000
                },
                lineItems: [
                    {
                        category: {
                            ref: "makerdao/budget-category",
                            id: "TravelAndEntertainment",
                            title: "Travel & Entertainment",
                            headcountExpense: true
                        },
                        group: {
                            ref: "makerdao/project",
                            id: "core-unit/SES/2023/005",
                            title: "Core Unit Operational Support"
                        },
                        budgetCap: 10000,
                        payment: 0,
                        actual: 4000,
                        forecast: [
                            {
                                month: "2023/02",
                                value: 30000
                            },
                            {
                                month: "2023/03",
                                value: 40000
                            },
                            {
                                month: "2023/04",
                                value: 30000
                            }
                        ]
                    }
                ]
            }
        ]
    }
}
```

### Budget Statement Actions

▸ For more information on Budget Statement actions, please refer to the [complete documentation](markdown/modules/BudgetStatement.actions.md).

#### Account

A budget statement might have multiple accounts, each with its own expenses.

-   `ADD_ACCOUNT`: Adds an account to the budget. This action accepts an array of accounts, so multiple accounts can be added in one action. The account can be initialized with all attributes but the only required attribute is an unique account address, which should follow a Gnosis-like format: `eth:0x...`.

```javascript
addAccount([{ address: string }]);
```

-   `UPDATE_ACCOUNT`: Edits existing accounts. Accounts are referenced by their address.

```javascript
updateAccount([{ address: string, ...account }]);
```

-   `DELETE_ACCOUNT`: Deletes the accounts with the provided addresses.

```javascript
deleteAccount(accounts: string[]);
```

#### Status

The budget goes through various status as it is reviewed by auditors.
It starts as a `Draft` which can then be submitted for `Review`. The auditor then either approves with or raises issues.

-   `SUBMIT_FOR_REVIEW`: Sets the budget as ready to be reviewed.

```javascript
submitForReview();
```

-   `ESCALATE`: Used by the auditor if there is any issue during the review

```javascript
escalate();
```

# Budget Statement Budget Statement

[@acaldas/document-model-libs](#readme) / [Exports](#modules) / [BudgetStatement](#budget-statement) / BudgetStatement

# Class: BudgetStatement

[BudgetStatement](#budget-statement).BudgetStatement

This is an abstract class representing a document and provides methods
for creating and manipulating documents.

**`Typeparam`**

T - The type of data stored in the document.

**`Typeparam`**

A - The type of action the document can take.

## Hierarchy

- `default`

- `default`

- `default`

- `default`

- `default`

- `default`

- [`BaseDocument`](#document-base-document)<[`State`](#state), [`BudgetStatementAction`](#budgetstatementaction)\>

  ↳ **`BudgetStatement`**

## Table of contents

### Constructors

- [constructor](#constructor)

### Properties

- [state](#state)
- [fileExtension](#fileextension)

### Account

- [accounts](#accounts)
- [addAccount](#addaccount)
- [deleteAccount](#deleteaccount)
- [getAccount](#getaccount)
- [updateAccount](#updateaccount)

### Budget Statement Accessors

- [month](#month)
- [owner](#owner)
- [quoteCurrency](#quotecurrency)

### Other Accessors

- [created](#created)
- [documentType](#documenttype)
- [initialState](#initialstate)
- [lastModified](#lastmodified)
- [name](#name)
- [operations](#operations)
- [revision](#revision)

### Status

- [status](#status)
- [approve](#approve)
- [escalate](#escalate)
- [reopenToDraft](#reopentodraft)
- [reopenToReview](#reopentoreview)
- [submitForReview](#submitforreview)

### Audit

- [addAuditReport](#addauditreport)
- [deleteAuditReport](#deleteauditreport)
- [getAuditReport](#getauditreport)
- [getAuditReports](#getauditreports)

### Line Item

- [addLineItem](#addlineitem)
- [deleteLineItem](#deletelineitem)
- [getLineItem](#getlineitem)
- [getLineItems](#getlineitems)
- [updateLineItem](#updatelineitem)

### Methods

- [dispatch](#dispatch)
- [getAttachment](#getattachment)
- [init](#init)
- [loadFromFile](#loadfromfile)
- [loadState](#loadstate)
- [prune](#prune)
- [redo](#redo)
- [saveToFile](#savetofile)
- [setName](#setname)
- [undo](#undo)
- [fromFile](#fromfile)
- [stateFromFile](#statefromfile)

### Topup

- [getTopupTransaction](#gettopuptransaction)
- [requestTopup](#requesttopup)
- [transferTopup](#transfertopup)

## Constructors

### constructor

• **new BudgetStatement**(`initialState?`)

Creates a new BudgetStatement instance.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `initialState?` | `Partial`<`Omit`<[`BudgetStatementDocument`](#budgetstatementdocument), ``"data"``\> & { `data`: `Partial`<[`State`](#state)\>  }\> | An optional object representing the initial state of the BudgetStatement. |

#### Inherited from

[BaseDocument](#document-base-document).[constructor](#constructor)

#### Defined in

[budget-statement/gen/object.ts:45](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/object.ts#L45)

## Properties

### state

• `Protected` **state**: [`Document`](#document)<[`State`](#state), [`BudgetStatementAction`](#budgetstatementaction)\>

#### Inherited from

[BaseDocument](#document-base-document).[state](#state)

#### Defined in

[document/object.ts:13](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L13)

___

### fileExtension

▪ `Static` **fileExtension**: `string` = `'phbs'`

The file extension used to save budget statements.

#### Defined in

[budget-statement/gen/object.ts:38](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/object.ts#L38)

## Account

### accounts

• `get` **accounts**(): [`Account`](#account)[]

Returns an array of all accounts in the budget statement.

#### Returns

[`Account`](#account)[]

#### Inherited from

AccountObject.accounts

#### Defined in

[budget-statement/gen/account/object.ts:52](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/account/object.ts#L52)

___

### addAccount

▸ **addAccount**(`accounts`): [`BudgetStatement`](#budget-statement-budget-statement)

Adds one or more accounts to the budget statement.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `accounts` | [`AccountInput`](#accountinput)[] | An array of AccountInput objects to add. |

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

AccountObject.addAccount

#### Defined in

[budget-statement/gen/account/object.ts:23](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/account/object.ts#L23)

___

### deleteAccount

▸ **deleteAccount**(`accounts`): [`BudgetStatement`](#budget-statement-budget-statement)

Deletes one or more accounts from the budget statement.

#### Parameters

| Name | Type |
| :------ | :------ |
| `accounts` | `string`[] |

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

AccountObject.deleteAccount

#### Defined in

[budget-statement/gen/account/object.ts:43](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/account/object.ts#L43)

___

### getAccount

▸ **getAccount**(`address`): `undefined` \| [`Account`](#account)

Returns the Account object with the specified address.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `address` | `string` | The address of the Account to retrieve. |

#### Returns

`undefined` \| [`Account`](#account)

#### Inherited from

AccountObject.getAccount

#### Defined in

[budget-statement/gen/account/object.ts:62](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/account/object.ts#L62)

___

### updateAccount

▸ **updateAccount**(`accounts`): [`BudgetStatement`](#budget-statement-budget-statement)

Updates one or more existing accounts in the budget statement.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `accounts` | [`AccountInput`](#accountinput)[] | An array of AccountInput objects to update. |

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

AccountObject.updateAccount

#### Defined in

[budget-statement/gen/account/object.ts:33](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/account/object.ts#L33)

## Budget Statement Accessors

### month

• `get` **month**(): ``null`` \| `string`

Gets the month of the budget statement.

#### Returns

``null`` \| `string`

#### Defined in

[budget-statement/gen/object.ts:59](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/object.ts#L59)

___

### owner

• `get` **owner**(): `Object`

Gets the owner of the budget statement.

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `id` | ``null`` \| `string` |
| `ref` | ``null`` \| `string` |
| `title` | ``null`` \| `string` |

#### Defined in

[budget-statement/gen/object.ts:67](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/object.ts#L67)

___

### quoteCurrency

• `get` **quoteCurrency**(): ``null`` \| `string`

Gets the quote currency of the budget statement.

#### Returns

``null`` \| `string`

#### Defined in

[budget-statement/gen/object.ts:75](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/object.ts#L75)

___

## Other Accessors

### created

• `get` **created**(): `string`

Gets the timestamp of the date the document was created.

#### Returns

`string`

#### Inherited from

AccountObject.created

#### Defined in

[document/object.ts:88](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L88)

___

### documentType

• `get` **documentType**(): `string`

Gets the type of document.

#### Returns

`string`

#### Inherited from

AccountObject.documentType

#### Defined in

[document/object.ts:81](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L81)

___

### initialState

• `get` **initialState**(): `Omit`<[`Document`](#document)<`T`, `A`\>, ``"initialState"``\>

Gets the initial state of the document.

#### Returns

`Omit`<[`Document`](#document)<`T`, `A`\>, ``"initialState"``\>

#### Inherited from

AccountObject.initialState

#### Defined in

[document/object.ts:109](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L109)

___

### lastModified

• `get` **lastModified**(): `string`

Gets the timestamp of the date the document was last modified.

#### Returns

`string`

#### Inherited from

AccountObject.lastModified

#### Defined in

[document/object.ts:95](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L95)

___

### name

• `get` **name**(): `string`

Gets the name of the document.

#### Returns

`string`

#### Inherited from

AccountObject.name

#### Defined in

[document/object.ts:74](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L74)

___

### operations

• `get` **operations**(): [`Operation`](#operation)<`BaseAction` \| `A`\>[]

Gets the list of operations performed on the document.

#### Returns

[`Operation`](#operation)<`BaseAction` \| `A`\>[]

#### Inherited from

AccountObject.operations

#### Defined in

[document/object.ts:116](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L116)

___

### revision

• `get` **revision**(): `number`

Gets the revision number of the document.

#### Returns

`number`

#### Inherited from

AccountObject.revision

#### Defined in

[document/object.ts:102](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L102)

## Status

### status

• `get` **status**(): [`BudgetStatus`](#budgetstatus)

Gets the current status of the budget statement.

#### Returns

[`BudgetStatus`](#budgetstatus)

The status of the budget statement.

#### Inherited from

StatusObject.status

#### Defined in

[budget-statement/gen/status/object.ts:68](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/status/object.ts#L68)

___

### approve

▸ **approve**(): [`BudgetStatement`](#budget-statement-budget-statement)

Approves the budget statement.

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

StatusObject.approve

#### Defined in

[budget-statement/gen/status/object.ts:38](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/status/object.ts#L38)

___

### escalate

▸ **escalate**(): [`BudgetStatement`](#budget-statement-budget-statement)

Escalates the budget statement.

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

StatusObject.escalate

#### Defined in

[budget-statement/gen/status/object.ts:29](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/status/object.ts#L29)

___

### reopenToDraft

▸ **reopenToDraft**(): [`BudgetStatement`](#budget-statement-budget-statement)

Reopens the budget statement to draft status.

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

A promise that resolves when the action is complete.

#### Inherited from

StatusObject.reopenToDraft

#### Defined in

[budget-statement/gen/status/object.ts:48](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/status/object.ts#L48)

___

### reopenToReview

▸ **reopenToReview**(): [`BudgetStatement`](#budget-statement-budget-statement)

Reopens the budget statement to review status.

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

A promise that resolves when the action is complete.

#### Inherited from

StatusObject.reopenToReview

#### Defined in

[budget-statement/gen/status/object.ts:58](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/status/object.ts#L58)

___

### submitForReview

▸ **submitForReview**(): [`BudgetStatement`](#budget-statement-budget-statement)

Submits the budget statement for review.

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

StatusObject.submitForReview

#### Defined in

[budget-statement/gen/status/object.ts:20](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/status/object.ts#L20)

## Audit

### addAuditReport

▸ **addAuditReport**(`reports`): [`BudgetStatement`](#budget-statement-budget-statement)

Adds audit reports to the budget statement.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `reports` | { `report`: [`DocumentFile`](#documentfile) ; `status`: [`AuditReportStatus`](#auditreportstatus) ; `timestamp?`: `string`  }[] | An array of audit report objects to add. |

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

AuditObject.addAuditReport

#### Defined in

[budget-statement/gen/audit/object.ts:20](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/audit/object.ts#L20)

___

### deleteAuditReport

▸ **deleteAuditReport**(`reports`): [`BudgetStatement`](#budget-statement-budget-statement)

Deletes audit reports from the budget statement.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `reports` | \`attachment://audits/${string}\`[] | An array of objects that contain the report attachment name of the audits items to be deleted. |

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

AuditObject.deleteAuditReport

#### Defined in

[budget-statement/gen/audit/object.ts:36](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/audit/object.ts#L36)

___

### getAuditReport

▸ **getAuditReport**(`report`): `undefined` \| [`AuditReport`](#auditreport)

Retrieves a specific audit report from the budget statement.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `report` | \`attachment://audits/${string}\` | The name of the attachment of the report to be retrieved. |

#### Returns

`undefined` \| [`AuditReport`](#auditreport)

The audit report object if it exists, or undefined if not.

#### Inherited from

AuditObject.getAuditReport

#### Defined in

[budget-statement/gen/audit/object.ts:57](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/audit/object.ts#L57)

___

### getAuditReports

▸ **getAuditReports**(): [`AuditReport`](#auditreport)[]

Retrieves all audit reports from the budget statement.

#### Returns

[`AuditReport`](#auditreport)[]

An array of audit report objects.

#### Inherited from

AuditObject.getAuditReports

#### Defined in

[budget-statement/gen/audit/object.ts:46](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/audit/object.ts#L46)

## Line Item

### addLineItem

▸ **addLineItem**(`account`, `lineItems`): [`BudgetStatement`](#budget-statement-budget-statement)

Adds a line item to the specified account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `string` | The address of the account to which the line item will be added. |
| `lineItems` | `Partial`<[`LineItem`](#lineitem)\> & `Pick`<[`LineItem`](#lineitem), ``"category"`` \| ``"group"``\>[] | An array of line item objects to be added to the account. |

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

LineItemObject.addLineItem

#### Defined in

[budget-statement/gen/line-item/object.ts:22](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/line-item/object.ts#L22)

___

### deleteLineItem

▸ **deleteLineItem**(`account`, `lineItems`): [`BudgetStatement`](#budget-statement-budget-statement)

Deletes line items for the specified account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `string` | The address of the account for which line items will be deleted. |
| `lineItems` | { `category`: `string` ; `group`: `string`  }[] | An array of objects that contain the category and group of the line items to be deleted. |

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

LineItemObject.deleteLineItem

#### Defined in

[budget-statement/gen/line-item/object.ts:50](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/line-item/object.ts#L50)

___

### getLineItem

▸ **getLineItem**(`account`, `lineItem`): `undefined` \| [`LineItem`](#lineitem)

Retrieves a specific line item for the specified account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `string` | The address of the account for which the line item will be retrieved. |
| `lineItem` | `Object` | An object that contains the category and group of the line item to be retrieved. |
| `lineItem.category` | `string` | - |
| `lineItem.group` | `string` | - |

#### Returns

`undefined` \| [`LineItem`](#lineitem)

The line item object that matches the specified category and group, or undefined if it does not exist.

#### Inherited from

LineItemObject.getLineItem

#### Defined in

[budget-statement/gen/line-item/object.ts:78](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/line-item/object.ts#L78)

___

### getLineItems

▸ **getLineItems**(`account`): `undefined` \| [`LineItem`](#lineitem)[]

Retrieves line items for the specified account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `string` | The address of the account for which line items will be retrieved. |

#### Returns

`undefined` \| [`LineItem`](#lineitem)[]

An array of line item objects for the specified account, or undefined if the account does not exist.

#### Inherited from

LineItemObject.getLineItems

#### Defined in

[budget-statement/gen/line-item/object.ts:64](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/line-item/object.ts#L64)

___

### updateLineItem

▸ **updateLineItem**(`account`, `lineItems`): [`BudgetStatement`](#budget-statement-budget-statement)

Updates line items for the specified account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `string` | The address of the account for which line items will be updated. |
| `lineItems` | [`LineItemInput`](#lineiteminput)[] | An array of line item input objects to be updated. |

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

LineItemObject.updateLineItem

#### Defined in

[budget-statement/gen/line-item/object.ts:36](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/line-item/object.ts#L36)

## Methods

### dispatch

▸ `Protected` **dispatch**(`action`): [`BudgetStatement`](#budget-statement-budget-statement)

Dispatches an action to update the state of the document.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `action` | `BaseAction` \| [`BudgetStatementAction`](#budgetstatementaction) | The action to dispatch. |

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

The Document instance.

#### Inherited from

[BaseDocument](#document-base-document).[dispatch](#dispatch)

#### Defined in

[document/object.ts:34](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L34)

___

### getAttachment

▸ **getAttachment**(`attachment`): [`DocumentFile`](#documentfile)

Gets the attachment associated with the given key.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `attachment` | \`attachment://${string}\` | The key of the attachment to retrieve. |

#### Returns

[`DocumentFile`](#documentfile)

#### Inherited from

[BaseDocument](#document-base-document).[getAttachment](#getattachment)

#### Defined in

[document/object.ts:124](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L124)

___

### init

▸ **init**(`budgetStatement`): [`BudgetStatement`](#budget-statement-budget-statement)

Initializes the state of the budget statement with the provided partial object.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `budgetStatement` | `Partial`<`Omit`<[`BudgetStatementDocument`](#budgetstatementdocument), ``"data"``\> & { `data`: `Partial`<[`State`](#state)\>  }\> | A partial object of the budget statement to initialize. |

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

InitObject.init

#### Defined in

[budget-statement/gen/init/object.ts:18](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/init/object.ts#L18)

___

### loadFromFile

▸ **loadFromFile**(`path`): `Promise`<`void`\>

Loads the budget statement from a file.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `path` | `string` | The path to the file to load. |

#### Returns

`Promise`<`void`\>

A promise that resolves with the loaded `BudgetStatement` instance.

#### Inherited from

[BaseDocument](#document-base-document).[loadFromFile](#loadfromfile)

#### Defined in

[budget-statement/gen/object.ts:95](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/object.ts#L95)

___

### loadState

▸ **loadState**(`state`, `operations`): `void`

Loads a document state and a set of operations.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `state` | `Pick`<[`Document`](#document)<[`State`](#state), [`BudgetStatementAction`](#budgetstatementaction)\>, ``"name"`` \| ``"data"``\> | The state to load. |
| `operations` | `number` | The operations to apply to the document. |

#### Returns

`void`

#### Inherited from

[BaseDocument](#document-base-document).[loadState](#loadstate)

#### Defined in

[document/object.ts:165](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L165)

___

### prune

▸ **prune**(`start?`, `end?`): `void`

Removes a range of operations from the document.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `start?` | `number` | The starting index of the range to remove. |
| `end?` | `number` | The ending index of the range to remove. |

#### Returns

`void`

#### Inherited from

[BaseDocument](#document-base-document).[prune](#prune)

#### Defined in

[document/object.ts:156](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L156)

___

### redo

▸ **redo**(`count`): `void`

Reapplies a number of actions to the document.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `count` | `number` | The number of actions to reapply. |

#### Returns

`void`

#### Inherited from

[BaseDocument](#document-base-document).[redo](#redo)

#### Defined in

[document/object.ts:148](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L148)

___

### saveToFile

▸ **saveToFile**(`path`): `Promise`<`string`\>

Saves the budget statement to a file.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `path` | `string` | The path to the file to save. |

#### Returns

`Promise`<`string`\>

A promise that resolves when the save operation completes.

#### Inherited from

[BaseDocument](#document-base-document).[saveToFile](#savetofile)

#### Defined in

[budget-statement/gen/object.ts:85](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/object.ts#L85)

___

### setName

▸ **setName**(`name`): `void`

Sets the name of the document.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | The new name of the document. |

#### Returns

`void`

#### Inherited from

[BaseDocument](#document-base-document).[setName](#setname)

#### Defined in

[document/object.ts:132](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L132)

___

### undo

▸ **undo**(`count`): `void`

Reverts a number of actions from the document.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `count` | `number` | The number of actions to revert. |

#### Returns

`void`

#### Inherited from

[BaseDocument](#document-base-document).[undo](#undo)

#### Defined in

[document/object.ts:140](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L140)

___

### fromFile

▸ `Static` **fromFile**(`path`): `Promise`<[`BudgetStatement`](#budget-statement-budget-statement)\>

Creates a new `BudgetStatement` instance from a file.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `path` | `string` | The path to the file to load. |

#### Returns

`Promise`<[`BudgetStatement`](#budget-statement-budget-statement)\>

A promise that resolves with the loaded `BudgetStatement` instance.

#### Defined in

[budget-statement/gen/object.ts:105](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/object.ts#L105)

___

### stateFromFile

▸ `Static` `Protected` **stateFromFile**<`T`, `A`\>(`path`, `reducer`): `Promise`<[`Document`](#document)<`T`, `BaseAction` \| `A`\>\>

Loads the state of the document from a file and returns it.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` |
| `A` | extends [`Action`](#action)<`string`\> |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `path` | `string` | The file path where the state is stored. |
| `reducer` | [`Reducer`](#reducer)<`T`, `BaseAction` \| `A`\> | The reducer function that updates the state. |

#### Returns

`Promise`<[`Document`](#document)<`T`, `BaseAction` \| `A`\>\>

The state of the document.

#### Inherited from

[BaseDocument](#document-base-document).[stateFromFile](#statefromfile)

#### Defined in

[document/object.ts:63](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L63)

## Topup

### getTopupTransaction

▸ **getTopupTransaction**(`account`): `undefined` \| { `id`: ``null`` \| `string` ; `requestedValue`: ``null`` \| `number` ; `value`: ``null`` \| `number`  }

Gets the top-up transaction for the specified account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `string` | The address of the account to get the top-up transaction for. |

#### Returns

`undefined` \| { `id`: ``null`` \| `string` ; `requestedValue`: ``null`` \| `number` ; `value`: ``null`` \| `number`  }

The top-up transaction for the specified account, if it exists.

#### Inherited from

TopupObject.getTopupTransaction

#### Defined in

[budget-statement/gen/topup/object.ts:47](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/topup/object.ts#L47)

___

### requestTopup

▸ **requestTopup**(`account`, `value`): [`BudgetStatement`](#budget-statement-budget-statement)

Adds a top-up request for the specified account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `string` | The address of the account to add the top-up request. |
| `value` | `number` | The value of the top-up request. |

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

TopupObject.requestTopup

#### Defined in

[budget-statement/gen/topup/object.ts:17](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/topup/object.ts#L17)

___

### transferTopup

▸ **transferTopup**(`account`, `value`, `transaction`): [`BudgetStatement`](#budget-statement-budget-statement)

Adds a top-up transer to the specified account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `string` | The address of the account to add the top-up transfer. |
| `value` | `number` | The value of the top-up transfer. |
| `transaction` | `string` | The transaction ID of the transfer. |

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

TopupObject.transferTopup

#### Defined in

[budget-statement/gen/topup/object.ts:31](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/topup/object.ts#L31)

# Document Base Document

[@acaldas/document-model-libs](#readme) / [Exports](#modules) / [Document](#document) / BaseDocument

# Class: BaseDocument<T, A\>

[Document](#document).BaseDocument

This is an abstract class representing a document and provides methods
for creating and manipulating documents.

**`Typeparam`**

T - The type of data stored in the document.

**`Typeparam`**

A - The type of action the document can take.

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` |
| `A` | extends [`Action`](#action) |

## Hierarchy

- **`BaseDocument`**

  ↳ [`BudgetStatement`](#budget-statement-budget-statement)

## Table of contents

### Constructors

- [constructor](#constructor)

### Properties

- [reducer](#reducer)
- [state](#state)

### Accessors

- [created](#created)
- [documentType](#documenttype)
- [initialState](#initialstate)
- [lastModified](#lastmodified)
- [name](#name)
- [operations](#operations)
- [revision](#revision)

### Methods

- [dispatch](#dispatch)
- [getAttachment](#getattachment)
- [loadFromFile](#loadfromfile)
- [loadState](#loadstate)
- [prune](#prune)
- [redo](#redo)
- [saveToFile](#savetofile)
- [setName](#setname)
- [undo](#undo)
- [stateFromFile](#statefromfile)

## Constructors

### constructor

• **new BaseDocument**<`T`, `A`\>(`reducer`, `initialState?`)

Constructs a BaseDocument instance with an initial state.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` |
| `A` | extends [`Action`](#action)<`string`\> |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `reducer` | [`Reducer`](#reducer)<`T`, `BaseAction` \| `A`\> | The reducer function that updates the state. |
| `initialState?` | `Partial`<[`Document`](#document)<`T`, `A`\>\> & { `data`: `T`  } | The initial state of the document. |

#### Defined in

[document/object.ts:21](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L21)

## Properties

### reducer

• `Private` **reducer**: [`Reducer`](#reducer)<`T`, `BaseAction` \| `A`\>

#### Defined in

[document/object.ts:14](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L14)

___

### state

• `Protected` **state**: [`Document`](#document)<`T`, `A`\>

#### Defined in

[document/object.ts:13](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L13)

## Accessors

### created

• `get` **created**(): `string`

Gets the timestamp of the date the document was created.

#### Returns

`string`

#### Defined in

[document/object.ts:88](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L88)

___

### documentType

• `get` **documentType**(): `string`

Gets the type of document.

#### Returns

`string`

#### Defined in

[document/object.ts:81](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L81)

___

### initialState

• `get` **initialState**(): `Omit`<[`Document`](#document)<`T`, `A`\>, ``"initialState"``\>

Gets the initial state of the document.

#### Returns

`Omit`<[`Document`](#document)<`T`, `A`\>, ``"initialState"``\>

#### Defined in

[document/object.ts:109](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L109)

___

### lastModified

• `get` **lastModified**(): `string`

Gets the timestamp of the date the document was last modified.

#### Returns

`string`

#### Defined in

[document/object.ts:95](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L95)

___

### name

• `get` **name**(): `string`

Gets the name of the document.

#### Returns

`string`

#### Defined in

[document/object.ts:74](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L74)

___

### operations

• `get` **operations**(): [`Operation`](#operation)<`BaseAction` \| `A`\>[]

Gets the list of operations performed on the document.

#### Returns

[`Operation`](#operation)<`BaseAction` \| `A`\>[]

#### Defined in

[document/object.ts:116](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L116)

___

### revision

• `get` **revision**(): `number`

Gets the revision number of the document.

#### Returns

`number`

#### Defined in

[document/object.ts:102](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L102)

## Methods

### dispatch

▸ `Protected` **dispatch**(`action`): [`BaseDocument`](#document-base-document)<`T`, `A`\>

Dispatches an action to update the state of the document.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `action` | `BaseAction` \| `A` | The action to dispatch. |

#### Returns

[`BaseDocument`](#document-base-document)<`T`, `A`\>

The Document instance.

#### Defined in

[document/object.ts:34](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L34)

___

### getAttachment

▸ **getAttachment**(`attachment`): [`DocumentFile`](#documentfile)

Gets the attachment associated with the given key.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `attachment` | \`attachment://${string}\` | The key of the attachment to retrieve. |

#### Returns

[`DocumentFile`](#documentfile)

#### Defined in

[document/object.ts:124](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L124)

___

### loadFromFile

▸ **loadFromFile**(`path`): `Promise`<`void`\>

Loads the state of the document from a file.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `path` | `string` | The file path where the state is stored. |

#### Returns

`Promise`<`void`\>

#### Defined in

[document/object.ts:53](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L53)

___

### loadState

▸ **loadState**(`state`, `operations`): `void`

Loads a document state and a set of operations.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `state` | `Pick`<[`Document`](#document)<`T`, `A`\>, ``"name"`` \| ``"data"``\> | The state to load. |
| `operations` | `number` | The operations to apply to the document. |

#### Returns

`void`

#### Defined in

[document/object.ts:165](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L165)

___

### prune

▸ **prune**(`start?`, `end?`): `void`

Removes a range of operations from the document.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `start?` | `number` | The starting index of the range to remove. |
| `end?` | `number` | The ending index of the range to remove. |

#### Returns

`void`

#### Defined in

[document/object.ts:156](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L156)

___

### redo

▸ **redo**(`count`): `void`

Reapplies a number of actions to the document.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `count` | `number` | The number of actions to reapply. |

#### Returns

`void`

#### Defined in

[document/object.ts:148](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L148)

___

### saveToFile

▸ `Protected` **saveToFile**(`path`, `extension`): `Promise`<`string`\>

Saves the state of the document to a file.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `path` | `string` | The file path where the state should be saved. |
| `extension` | `string` | The file extension to use when saving the state. |

#### Returns

`Promise`<`string`\>

The file path where the state was saved.

#### Defined in

[document/object.ts:45](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L45)

___

### setName

▸ **setName**(`name`): `void`

Sets the name of the document.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | The new name of the document. |

#### Returns

`void`

#### Defined in

[document/object.ts:132](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L132)

___

### undo

▸ **undo**(`count`): `void`

Reverts a number of actions from the document.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `count` | `number` | The number of actions to revert. |

#### Returns

`void`

#### Defined in

[document/object.ts:140](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L140)

___

### stateFromFile

▸ `Static` `Protected` **stateFromFile**<`T`, `A`\>(`path`, `reducer`): `Promise`<[`Document`](#document)<`T`, `BaseAction` \| `A`\>\>

Loads the state of the document from a file and returns it.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` |
| `A` | extends [`Action`](#action)<`string`\> |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `path` | `string` | The file path where the state is stored. |
| `reducer` | [`Reducer`](#reducer)<`T`, `BaseAction` \| `A`\> | The reducer function that updates the state. |

#### Returns

`Promise`<[`Document`](#document)<`T`, `BaseAction` \| `A`\>\>

The state of the document.

#### Defined in

[document/object.ts:63](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L63)

# Modules

[@acaldas/document-model-libs](#readme) / Exports

# @acaldas/document-model-libs

## Table of contents

### Namespaces

- [BudgetStatement](#budget-statement)
- [Document](#document)

### Variables

- [default](#default)

## Variables

### default

• **default**: `Object`

#### Type declaration

| Name              | Type                                            |
| :---------------- | :---------------------------------------------- |
| `BudgetStatement` | [`BudgetStatement`](#budget-statement) |
| `Document`        | [`Document`](#document)               |

#### Defined in

[index.doc.ts:35](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/index.doc.ts#L35)

# Budget Statement Actions

[@acaldas/document-model-libs](#readme) / [Exports](#modules) / [BudgetStatement](#budget-statement) / actions

# Namespace: actions

[BudgetStatement](#budget-statement).actions

## Table of contents

### Account

- [addAccount](#addaccount)
- [deleteAccount](#deleteaccount)
- [updateAccount](#updateaccount)

### Audit

- [addAuditReport](#addauditreport)
- [deleteAuditReport](#deleteauditreport)

### Line Item

- [addLineItem](#addlineitem)
- [deleteLineItem](#deletelineitem)
- [updateLineItem](#updatelineitem)

### Status

- [approve](#approve)
- [escalate](#escalate)
- [reopenToDraft](#reopentodraft)
- [reopenToReview](#reopentoreview)
- [submitForReview](#submitforreview)

### Init

- [init](#init)

### Topup

- [requestTopup](#requesttopup)
- [transferTopup](#transfertopup)

## Account

### addAccount

▸ **addAccount**(`accounts`): `AddAccountAction`

Action creator for adding accounts to the budget statement.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `accounts` | [`AccountInput`](#accountinput)[] | Array of account inputs to be added. |

#### Returns

`AddAccountAction`

#### Defined in

[budget-statement/gen/account/creators.ts:24](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/account/creators.ts#L24)

___

### deleteAccount

▸ **deleteAccount**(`accounts`): `DeleteAccountAction`

Action creator for deleting accounts from the budget statement.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `accounts` | `string`[] | Array of addresses of the accounts to be deleted. |

#### Returns

`DeleteAccountAction`

#### Defined in

[budget-statement/gen/account/creators.ts:42](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/account/creators.ts#L42)

___

### updateAccount

▸ **updateAccount**(`accounts`): `UpdateAccountAction`

Action creator for updating accounts in the budget statement.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `accounts` | [`AccountInput`](#accountinput)[] | Array of account inputs to be updated. |

#### Returns

`UpdateAccountAction`

#### Defined in

[budget-statement/gen/account/creators.ts:34](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/account/creators.ts#L34)

## Audit

### addAuditReport

▸ **addAuditReport**(`reports`): `AddAuditReportAction`

Creates an action to add one or more audit reports to the store.

**`Remarks`**

The `timestamp` property in each report is optional. If not provided, the current time will be used.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `reports` | { `report`: [`DocumentFile`](#documentfile) ; `status`: [`AuditReportStatus`](#auditreportstatus) ; `timestamp?`: `string`  }[] | An array of objects representing the audit reports to add. |

#### Returns

`AddAuditReportAction`

#### Defined in

[budget-statement/gen/audit/creators.ts:21](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/audit/creators.ts#L21)

___

### deleteAuditReport

▸ **deleteAuditReport**(`reports`): `DeleteAuditReportAction`

Creates an action to delete one or more audit reports from the state.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `reports` | \`attachment://audits/${string}\`[] | An array of reports to be deleted. |

#### Returns

`DeleteAuditReportAction`

The created action.

#### Defined in

[budget-statement/gen/audit/creators.ts:46](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/audit/creators.ts#L46)

## Line Item

### addLineItem

▸ **addLineItem**(`account`, `lineItems`): `AddLineItemAction`

Creates an action to add one or more line items to an account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `string` | The account to add line items to. |
| `lineItems` | `Partial`<[`LineItem`](#lineitem)\> & `Pick`<[`LineItem`](#lineitem), ``"category"`` \| ``"group"``\>[] | An array of line items to add to the account. |

#### Returns

`AddLineItemAction`

#### Defined in

[budget-statement/gen/line-item/creators.ts:21](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/line-item/creators.ts#L21)

___

### deleteLineItem

▸ **deleteLineItem**(`account`, `lineItems`): `DeleteLineItemAction`

Creates an action to delete one or more line items from an account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `string` | The account containing the line items to delete. |
| `lineItems` | { `category`: `string` ; `group`: `string`  }[] | An array of line items to delete from the account. |

#### Returns

`DeleteLineItemAction`

#### Defined in

[budget-statement/gen/line-item/creators.ts:53](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/line-item/creators.ts#L53)

___

### updateLineItem

▸ **updateLineItem**(`account`, `lineItems`): `UpdateLineItemAction`

Creates an action to update one or more line items in an account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `string` | The account containing the line items to update. |
| `lineItems` | [`LineItemInput`](#lineiteminput)[] | An array of line items to update in the account. |

#### Returns

`UpdateLineItemAction`

#### Defined in

[budget-statement/gen/line-item/creators.ts:37](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/line-item/creators.ts#L37)

## Status

### approve

▸ **approve**(): `ApproveAction`

Approves the budget statement.

#### Returns

`ApproveAction`

#### Defined in

[budget-statement/gen/status/creators.ts:35](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/status/creators.ts#L35)

___

### escalate

▸ **escalate**(): `EscalateAction`

Escalates the budget statement if there is any issue.

#### Returns

`EscalateAction`

#### Defined in

[budget-statement/gen/status/creators.ts:28](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/status/creators.ts#L28)

___

### reopenToDraft

▸ **reopenToDraft**(): `ReopenToDraftAction`

Reopens the budget statement to draft state.

#### Returns

`ReopenToDraftAction`

#### Defined in

[budget-statement/gen/status/creators.ts:42](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/status/creators.ts#L42)

___

### reopenToReview

▸ **reopenToReview**(): `ReopenToReviewAction`

Reopens the budget statement to review state.

#### Returns

`ReopenToReviewAction`

#### Defined in

[budget-statement/gen/status/creators.ts:50](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/status/creators.ts#L50)

___

### submitForReview

▸ **submitForReview**(): `SubmitForReviewAction`

Submits the budget statement for review.

#### Returns

`SubmitForReviewAction`

#### Defined in

[budget-statement/gen/status/creators.ts:20](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/status/creators.ts#L20)

## Init

### init

▸ **init**(`budgetStatement`): `InitAction`

Initializes the budget statement state with the provided data.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `budgetStatement` | `Partial`<`Omit`<[`BudgetStatementDocument`](#budgetstatementdocument), ``"data"``\> & { `data`: `Partial`<[`State`](#state)\>  }\> | Partial budget statement data to initialize the state with. |

#### Returns

`InitAction`

#### Defined in

[budget-statement/gen/init/creators.ts:11](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/init/creators.ts#L11)

## Topup

### requestTopup

▸ **requestTopup**(`account`, `value`): `RequestTopupAction`

Action creator for requesting a top-up for an account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `string` | The address of the account to top-up. |
| `value` | `number` | The amount to top-up the account by. |

#### Returns

`RequestTopupAction`

#### Defined in

[budget-statement/gen/topup/creators.ts:18](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/topup/creators.ts#L18)

___

### transferTopup

▸ **transferTopup**(`account`, `value`, `transaction`): `TransferTopupAction`

Action creator for transferring top-up to an account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `string` | The address of the account to transfer top-up to. |
| `value` | `number` | The amount of top-up to transfer. |
| `transaction` | `string` | The transaction ID of the transfer. |

#### Returns

`TransferTopupAction`

#### Defined in

[budget-statement/gen/topup/creators.ts:30](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/gen/topup/creators.ts#L30)

# Budget Statement

[@acaldas/document-model-libs](#readme) / [Exports](#modules) / BudgetStatement

# Namespace: BudgetStatement

The BudgetStatement module provides functionality for managing budget statements.

**`Remarks`**

This module exports the following:
- All the actions available of the BudgetStatement model, as well as those from the base document.
- The reducer which implements the business logic for each action.
- BudgetStatement: A class representing a budget statement object, to manage a budget statement in an imperative way.
- Utility functions to create Budget Statements and load/save to file.

## Table of contents

### Namespaces

- [actions](#budget-statement-actions)
- [utils](#budget-statement-utils)

### Classes

- [BudgetStatement](#budget-statement-budget-statement)

### Type Aliases

- [Account](#account)
- [AccountInput](#accountinput)
- [AuditAttachment](#auditattachment)
- [AuditReport](#auditreport)
- [AuditReportInput](#auditreportinput)
- [AuditReportStatus](#auditreportstatus)
- [BudgetStatementAction](#budgetstatementaction)
- [BudgetStatementDocument](#budgetstatementdocument)
- [BudgetStatus](#budgetstatus)
- [LineItem](#lineitem)
- [LineItemInput](#lineiteminput)
- [State](#state)

### Functions

- [reducer](#reducer)

## Type Aliases

### Account

Ƭ **Account**: `Object`

Represents an account for which expenses are managed in a budget statement.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `accountBalance` | { `timestamp`: `string` \| ``null`` ; `value`: `number` \| ``null``  } | The balance of the account. |
| `accountBalance.timestamp` | `string` \| ``null`` | The timestamp for which the balance is recorded. |
| `accountBalance.value` | `number` \| ``null`` | The balance value. |
| `address` | `string` | The wallet address associated with the account. |
| `lineItems` | [`LineItem`](#lineitem)[] | The line items associated with the account. |
| `name` | `string` | The name of the account. |
| `targetBalance` | { `comment`: `string` \| ``null`` ; `value`: `number` \| ``null``  } | The target balance of the account. |
| `targetBalance.comment` | `string` \| ``null`` | Any comment associated with the target balance. |
| `targetBalance.value` | `number` \| ``null`` | The target balance value. |
| `topupTransaction` | { `id`: `string` \| ``null`` ; `requestedValue`: `number` \| ``null`` ; `value`: `number` \| ``null``  } | The topup transaction associated with the account. |
| `topupTransaction.id` | `string` \| ``null`` | The ID of the topup transaction. |
| `topupTransaction.requestedValue` | `number` \| ``null`` | The requested value for the topup transaction. |
| `topupTransaction.value` | `number` \| ``null`` | The actual value transferred in the topup transaction. |

#### Defined in

[budget-statement/custom/types.ts:59](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/custom/types.ts#L59)

___

### AccountInput

Ƭ **AccountInput**: `Partial`<[`Account`](#account)\> & `Pick`<[`Account`](#account), ``"address"``\>

Represents the input for creating or updating an account.

**`Remarks`**

The only necessary attribute is the account address,
as it is an unique attribute used to identify the account.

#### Defined in

[budget-statement/custom/types.ts:97](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/custom/types.ts#L97)

___

### AuditAttachment

Ƭ **AuditAttachment**: \`attachment://audits/${string}\`

A string literal type representing the format for attaching audit reports to a budget statement.

#### Defined in

[budget-statement/custom/types.ts:116](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/custom/types.ts#L116)

___

### AuditReport

Ƭ **AuditReport**: `Object`

Represents an audit report for a budget statement.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `report` | [`AuditAttachment`](#auditattachment) | The attachment for the audit report. |
| `status` | [`AuditReportStatus`](#auditreportstatus) | The status of the audit report. |
| `timestamp` | `string` | The timestamp of the audit report. |

#### Defined in

[budget-statement/custom/types.ts:121](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/custom/types.ts#L121)

___

### AuditReportInput

Ƭ **AuditReportInput**: `Object`

Represents the input for an audit report to be added to a budget statement.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `report` | [`DocumentFile`](#documentfile) | The data for the audit report. |
| `status` | [`AuditReportStatus`](#auditreportstatus) | The status of the audit report. |
| `timestamp` | `string` | The timestamp for the audit report. |

#### Defined in

[budget-statement/custom/types.ts:133](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/custom/types.ts#L133)

___

### AuditReportStatus

Ƭ **AuditReportStatus**: ``"Approved"`` \| ``"ApprovedWithComments"`` \| ``"NeedsAction"`` \| ``"Escalated"``

Represents the status of an audit report: 'Approved', 'ApprovedWithComments', 'NeedsAction', or 'Escalated'.

#### Defined in

[budget-statement/custom/types.ts:107](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/custom/types.ts#L107)

___

### BudgetStatementAction

Ƭ **BudgetStatementAction**: `BudgetStatementAccountAction` \| `BudgetStatementInitAction` \| `BudgetStatementLineItemAction` \| `BudgetStatementStatusAction` \| `BudgetStatementTopupAction` \| `BudgetStatementAuditReportAction`

Represents the possible actions that can be performed on a budget statement.

#### Defined in

[budget-statement/custom/types.ts:185](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/custom/types.ts#L185)

___

### BudgetStatementDocument

Ƭ **BudgetStatementDocument**: [`Document`](#document)<[`State`](#state), [`BudgetStatementAction`](#budgetstatementaction)\>

Represents a budget statement document, which extends the base Document type.

#### Defined in

[budget-statement/custom/types.ts:196](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/custom/types.ts#L196)

___

### BudgetStatus

Ƭ **BudgetStatus**: ``"Draft"`` \| ``"Review"`` \| ``"Final"`` \| ``"Escalated"``

Represents the status of the budget statement: 'Draft', 'Review', 'Final', or 'Escalated'.

#### Defined in

[budget-statement/custom/types.ts:102](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/custom/types.ts#L102)

___

### LineItem

Ƭ **LineItem**: `Object`

Represents an expense item for a specific account.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `actual` | `number` \| ``null`` | The actual value of the expense. |
| `budgetCap` | `number` \| ``null`` | The budget cap for the expense. |
| `category` | { `headcountExpense`: `boolean` ; `id`: `string` ; `ref`: `string` ; `title`: `string`  } | The reference to the category of the expense. |
| `category.headcountExpense` | `boolean` | - |
| `category.id` | `string` | - |
| `category.ref` | `string` | - |
| `category.title` | `string` | - |
| `forecast` | { `month`: `string` ; `value`: `number`  }[] | The forecast for the next 3 months for that expense. |
| `group` | { `id`: `string` ; `ref`: `string` ; `title`: `string`  } | The reference to the group of the expense. |
| `group.id` | `string` | - |
| `group.ref` | `string` | - |
| `group.title` | `string` | - |
| `payment` | `number` \| ``null`` | The payment done to the wallet in that month. |

#### Defined in

[budget-statement/custom/types.ts:12](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/custom/types.ts#L12)

___

### LineItemInput

Ƭ **LineItemInput**: `Partial`<`Omit`<[`LineItem`](#lineitem), ``"category"`` \| ``"group"``\>\> & { `category`: `string` ; `group`: `string`  }

Represents the input for creating or updating a line item.

**`Remarks`**

The only necessary attributes are the category and the group
as they are used to identify the line item.

#### Defined in

[budget-statement/custom/types.ts:46](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/custom/types.ts#L46)

___

### State

Ƭ **State**: `Object`

Represents the state of a budget statement.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `accounts` | [`Account`](#account)[] | The list of accounts in the budget statement. |
| `auditReports` | [`AuditReport`](#auditreport)[] | The list of audit reports for the budget statement. |
| `month` | `string` \| ``null`` | The month that the budget statement refers to. |
| `owner` | { `id`: `string` \| ``null`` ; `ref`: `string` \| ``null`` ; `title`: `string` \| ``null``  } | A reference to the owner of the budget statement. |
| `owner.id` | `string` \| ``null`` | - |
| `owner.ref` | `string` \| ``null`` | - |
| `owner.title` | `string` \| ``null`` | - |
| `quoteCurrency` | `string` \| ``null`` | The quote currency for the budget statement. |
| `status` | [`BudgetStatus`](#budgetstatus) | The status of the budget statement. |

#### Defined in

[budget-statement/custom/types.ts:151](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/custom/types.ts#L151)

## Functions

### reducer

▸ **reducer**(`state`, `action`): [`Document`](#document)<[`State`](#state), [`BudgetStatementAction`](#budgetstatementaction)\>

Reducer for the BudgetStatement module, which handles operations related to budget statements.

**`Remarks`**

This reducer handles the following actions:
- `INIT: initializes the state of the module.
- `ADD_ACCOUNT`: adds an account to the state.
- `UPDATE_ACCOUNT`: updates an account in the state.
- `DELETE_ACCOUNT`: removes an account from the state.
- `ADD_LINE_ITEM`: adds a line item to an account in the state.
- `UPDATE_LINE_ITEM`: updates a line item in an account in the state.
- `DELETE_LINE_ITEM`: removes a line item from an account in the state.
- `SUBMIT_FOR_REVIEW`: updates the status of the budget statement to "Under Review".
- `ESCALATE`: escalates the budget statement to a higher authority.
- `APPROVE`: approves the budget statement.
- `REOPEN_TO_DRAFT`: changes the status of the budget statement to "Draft".
- `REOPEN_TO_REVIEW`: changes the status of the budget statement to "Under Review".
- `REQUEST_TOPUP`: requests a top-up of an account.
- `TRANSFER_TOPUP`: transfers a top-up to an account.
- `ADD_AUDIT_REPORT`: adds an audit report to an account in the state.
- `DELETE_AUDIT_REPORT`: removes an audit report from an account in the state.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `state` | [`Document`](#document)<[`State`](#state), `BaseAction` \| [`BudgetStatementAction`](#budgetstatementaction)\> | The current state of the module. |
| `action` | `BaseAction` \| [`BudgetStatementAction`](#budgetstatementaction) | The action to be performed on the state. |

#### Returns

[`Document`](#document)<[`State`](#state), [`BudgetStatementAction`](#budgetstatementaction)\>

The new state after applying the action.

#### Defined in

[document/utils/base.ts:59](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/utils/base.ts#L59)

# Budget Statement Utils

[@acaldas/document-model-libs](#readme) / [Exports](#modules) / [BudgetStatement](#budget-statement) / utils

# Namespace: utils

[BudgetStatement](#budget-statement).utils

## Table of contents

### Functions

- [createAccount](#createaccount)
- [createBudgetStatement](#createbudgetstatement)
- [createLineItem](#createlineitem)
- [loadBudgetStatementFromFile](#loadbudgetstatementfromfile)
- [saveBudgetStatementToFile](#savebudgetstatementtofile)

## Functions

### createAccount

▸ **createAccount**(`input`): [`Account`](#account)

Creates a new Account with default properties and the given input properties.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | [`AccountInput`](#accountinput) | The input properties of the account. |

#### Returns

[`Account`](#account)

The new Account object.

#### Defined in

[budget-statement/custom/utils.ts:50](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/custom/utils.ts#L50)

___

### createBudgetStatement

▸ **createBudgetStatement**(`initialState?`): [`BudgetStatementDocument`](#budgetstatementdocument)

Creates a new BudgetStatement document with an initial state.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `initialState?` | `Partial`<`Omit`<[`BudgetStatementDocument`](#budgetstatementdocument), ``"data"``\> & { `data`: `Partial`<[`State`](#state)\>  }\> | The initial state of the document. |

#### Returns

[`BudgetStatementDocument`](#budgetstatementdocument)

The new BudgetStatement document.

#### Defined in

[budget-statement/custom/utils.ts:20](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/custom/utils.ts#L20)

___

### createLineItem

▸ **createLineItem**(`input`): [`LineItem`](#lineitem)

Creates a new LineItem with default properties and the given input properties.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | `Partial`<[`LineItem`](#lineitem)\> & `Pick`<[`LineItem`](#lineitem), ``"category"`` \| ``"group"``\> | The input properties of the line item. |

#### Returns

[`LineItem`](#lineitem)

The new LineItem object.

#### Defined in

[budget-statement/custom/utils.ts:74](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/custom/utils.ts#L74)

___

### loadBudgetStatementFromFile

▸ **loadBudgetStatementFromFile**(`path`): `Promise`<[`BudgetStatementDocument`](#budgetstatementdocument)\>

Loads the BudgetStatement document from the specified file path.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `path` | `string` | The file path to load the document from. |

#### Returns

`Promise`<[`BudgetStatementDocument`](#budgetstatementdocument)\>

A promise that resolves with the loaded BudgetStatement document.

#### Defined in

[budget-statement/custom/utils.ts:102](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/custom/utils.ts#L102)

___

### saveBudgetStatementToFile

▸ **saveBudgetStatementToFile**(`document`, `path`): `Promise`<`string`\>

Saves the BudgetStatement document to the specified file path.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `document` | [`BudgetStatementDocument`](#budgetstatementdocument) | The BudgetStatement document to save. |
| `path` | `string` | The file path to save the document to. |

#### Returns

`Promise`<`string`\>

A promise that resolves with the saved file path.

#### Defined in

[budget-statement/custom/utils.ts:90](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/budget-statement/custom/utils.ts#L90)

# Document Actions

[@acaldas/document-model-libs](#readme) / [Exports](#modules) / [Document](#document) / actions

# Namespace: actions

[Document](#document).actions

## Table of contents

### Actions Functions

- [loadState](#loadstate)
- [prune](#prune)
- [redo](#redo)
- [setName](#setname)
- [undo](#undo)

## Actions Functions

### loadState

▸ **loadState**(`state`, `operations`): `LoadStateAction`

Replaces the state of the document.

**`Remarks`**

This action shouldn't be used directly. It is dispatched by the [prune](#prune) action.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `state` | `Pick`<[`Document`](#document)<`unknown`, [`Action`](#action)<`string`\>\>, ``"name"`` \| ``"data"``\> | State to be set in the document. |
| `operations` | `number` | Number of operations that were removed from the previous state. |

#### Returns

`LoadStateAction`

#### Defined in

[document/actions/creators.ts:65](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/actions/creators.ts#L65)

___

### prune

▸ **prune**(`start?`, `end?`): `PruneAction`

Joins multiple operations into a single [LOAD_STATE](#loadstate) operation.

**`Remarks`**

Useful to keep operations history smaller. Operations to prune are selected by index,
similar to the [slice](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice) method in Arrays.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `start?` | `number` | Index of the first operation to prune |
| `end?` | `number` | Index of the last operation to prune |

#### Returns

`PruneAction`

#### Defined in

[document/actions/creators.ts:52](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/actions/creators.ts#L52)

___

### redo

▸ **redo**(`count?`): `RedoAction`

Cancels the last `count` [UNDO](#undo) operations.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `count` | `number` | `1` | Number of UNDO operations to cancel |

#### Returns

`RedoAction`

#### Defined in

[document/actions/creators.ts:39](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/actions/creators.ts#L39)

___

### setName

▸ **setName**(`name`): `SetNameAction`

Changes the name of the document.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | The name to be set in the document. |

#### Returns

`SetNameAction`

#### Defined in

[document/actions/creators.ts:22](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/actions/creators.ts#L22)

___

### undo

▸ **undo**(`count?`): `UndoAction`

Cancels the last `count` operations.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `count` | `number` | `1` | Number of operations to cancel |

#### Returns

`UndoAction`

#### Defined in

[document/actions/creators.ts:31](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/actions/creators.ts#L31)

# Document

[@acaldas/document-model-libs](#readme) / [Exports](#modules) / Document

# Namespace: Document

This module exports all the public types, functions, and objects
from the document module. It provides an easy-to-use interface
for managing documents, and can be used in any Redux-based
application. This module exports:
- All action creators for the base document actions.
- The Document object, which is used to for creating and
manipulating documents in an object-oriented way.
- The baseReducer function, which is a reducer for managing
documents
- Various utility functions to be used by Document Models.

## Table of contents

### Namespaces

- [actions](#document-actions)
- [utils](#document-utils)

### Classes

- [BaseDocument](#document-base-document)

### Type Aliases

- [Action](#action)
- [Attachment](#attachment)
- [Document](#document)
- [DocumentFile](#documentfile)
- [DocumentHeader](#documentheader)
- [FileRegistry](#fileregistry)
- [ImmutableReducer](#immutablereducer)
- [Operation](#operation)
- [Reducer](#reducer)

### Functions

- [applyMixins](#applymixins)
- [baseReducer](#basereducer)

## Type Aliases

### Action

Ƭ **Action**<`T`\>: `Object`

Defines the basic structure of an action.

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | `string` | The name of the action type. A `string` type by default. |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `input?` | `unknown` | The payload of the action. |
| `type` | `T` | The name of the action. |

#### Defined in

[document/types.ts:9](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/types.ts#L9)

___

### Attachment

Ƭ **Attachment**: \`attachment://${string}\`

String type representing an attachment in a Document.

**`Remarks`**

Attachment string is formatted as `attachment://<filename>`.

#### Defined in

[document/types.ts:126](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/types.ts#L126)

___

### Document

Ƭ **Document**<`Data`, `A`\>: [`DocumentHeader`](#documentheader) & { `data`: `Data` ; `fileRegistry`: [`FileRegistry`](#fileregistry) ; `initialState`: `Omit`<[`Document`](#document)<`Data`, `A`\>, ``"initialState"``\> ; `operations`: [`Operation`](#operation)<`A` \| `BaseAction`\>[]  }

The base type of a document model.

**`Remarks`**

This type is extended by all Document models.

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `Data` | `unknown` | The type of the document data attribute. |
| `A` | extends [`Action`](#action) = [`Action`](#action) | The type of the actions supported by the Document. |

#### Defined in

[document/types.ts:106](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/types.ts#L106)

___

### DocumentFile

Ƭ **DocumentFile**: `Object`

The attributes stored for a file. Namely, attachments of a document.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | `string` | The binary data of the attachment in Base64 |
| `extension?` | `string` | - |
| `fileName?` | `string` | - |
| `mimeType` | `string` | The MIME type of the attachment |

#### Defined in

[document/types.ts:76](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/types.ts#L76)

___

### DocumentHeader

Ƭ **DocumentHeader**: `Object`

The base attributes of a [Document](#document).

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `created` | `string` | The timestamp of the creation date of the document. |
| `documentType` | `string` | The type of the document model. |
| `lastModified` | `string` | The timestamp of the last change in the document. |
| `name` | `string` | The name of the document. |
| `revision` | `number` | The number of operations applied to the document. |

#### Defined in

[document/types.ts:60](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/types.ts#L60)

___

### FileRegistry

Ƭ **FileRegistry**: `Record`<[`Attachment`](#attachment), [`DocumentFile`](#documentfile)\>

Object that indexes attachments of a Document.

**`Remarks`**

This is used to reduce memory usage to avoid
multiple instances of the binary data of the attachments.

#### Defined in

[document/types.ts:95](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/types.ts#L95)

___

### ImmutableReducer

Ƭ **ImmutableReducer**<`State`, `A`\>: (`state`: `WritableDraft`<[`Document`](#document)<`State`, `A`\>\>, `action`: `A`) => [`Document`](#document)<`State`, `A`\> \| `void`

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `State` | `State` | The type of the document data. |
| `A` | extends [`Action`](#action) | The type of the actions supported by the reducer. |

#### Type declaration

▸ (`state`, `action`): [`Document`](#document)<`State`, `A`\> \| `void`

A [Reducer](#reducer) that prevents mutable code from changing the previous state.

**`Remarks`**

This reducer is wrapped with [Immer](https://immerjs.github.io/immer/).
This allows the reducer code to be mutable, making it simpler and
avoiding unintended changes in the provided state.
The returned state will always be a new object.

##### Parameters

| Name | Type |
| :------ | :------ |
| `state` | `WritableDraft`<[`Document`](#document)<`State`, `A`\>\> |
| `action` | `A` |

##### Returns

[`Document`](#document)<`State`, `A`\> \| `void`

#### Defined in

[document/types.ts:40](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/types.ts#L40)

___

### Operation

Ƭ **Operation**<`A`\>: `A` & { `index`: `number`  }

An operation that was applied to a [Document](#document).

**`Remarks`**

Wraps an action with an index, to be added to the operations history of a Document.
The `index` field is used to keep all operations in order and enable replaying the
document's history from the beginning.

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `A` | extends [`Action`](#action) = [`Action`](#action) | The type of the action. |

#### Defined in

[document/types.ts:55](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/types.ts#L55)

___

### Reducer

Ƭ **Reducer**<`State`, `A`\>: (`state`: [`Document`](#document)<`State`, `A`\>, `action`: `A`) => [`Document`](#document)<`State`, `A`\>

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `State` | `State` | The type of the document data. |
| `A` | extends [`Action`](#action) | The type of the actions supported by the reducer. |

#### Type declaration

▸ (`state`, `action`): [`Document`](#document)<`State`, `A`\>

A pure function that takes an action and the previous state
of the document and returns the new state.

##### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`Document`](#document)<`State`, `A`\> |
| `action` | `A` |

##### Returns

[`Document`](#document)<`State`, `A`\>

#### Defined in

[document/types.ts:23](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/types.ts#L23)

## Functions

### applyMixins

▸ **applyMixins**(`derivedCtor`, `constructors`): `void`

Applies multiple mixins to a base class.
Used to have separate mixins to group methods by actions.

**`Remarks`**

[https://www.typescriptlang.org/docs/handbook/mixins.html#alternative-pattern](https://www.typescriptlang.org/docs/handbook/mixins.html#alternative-pattern)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `derivedCtor` | `any` | The class to apply the mixins to. |
| `constructors` | `any`[] | The constructors of the mixins. |

#### Returns

`void`

#### Defined in

[document/object.ts:183](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/object.ts#L183)

___

### baseReducer

▸ **baseReducer**<`T`, `A`\>(`state`, `action`, `customReducer`): [`Document`](#document)<`T`, `A`\>

Base document reducer that wraps a custom document reducer and handles
document-level actions such as undo, redo, prune, and set name.

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | `T` | The type of the state of the custom reducer. |
| `A` | extends [`Action`](#action)<`string`\> | The type of the actions of the custom reducer. |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `state` | [`Document`](#document)<`T`, `A`\> | The current state of the document. |
| `action` | `BaseAction` \| `A` | The action object to apply to the state. |
| `customReducer` | [`ImmutableReducer`](#immutablereducer)<`T`, `A`\> | The custom reducer that implements the application logic specific to the document's state. |

#### Returns

[`Document`](#document)<`T`, `A`\>

The new state of the document.

#### Defined in

[document/reducer.ts:149](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/reducer.ts#L149)

# Document Utils

[@acaldas/document-model-libs](#readme) / [Exports](#modules) / [Document](#document) / utils

# Namespace: utils

[Document](#document).utils

## Table of contents

### Functions

- [createAction](#createaction)
- [createDocument](#createdocument)
- [createReducer](#createreducer)
- [getLocalFile](#getlocalfile)
- [getRemoteFile](#getremotefile)
- [hashAttachment](#hashattachment)
- [loadFromFile](#loadfromfile)
- [saveToFile](#savetofile)

## Functions

### createAction

▸ **createAction**<`A`\>(`type`, `input?`): `A`

Helper function to be used by action creators.

**`Remarks`**

Creates an action with the given type and input properties. The input
properties default to an empty object.

**`Throws`**

Error if the type is empty or not a string.

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `A` | extends [`Action`](#action)<`string`\> | Type of the action to be returned. |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `type` | `A`[``"type"``] | The type of the action. |
| `input` | `A`[``"input"``] | The input properties of the action. |

#### Returns

`A`

The new action.

#### Defined in

[document/utils/base.ts:22](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/utils/base.ts#L22)

___

### createDocument

▸ **createDocument**<`T`, `A`\>(`initialState?`): [`Document`](#document)<`T`, `A`\>

Builds the initial document state from the provided data.

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | `T` | The type of the data. |
| `A` | extends [`Action`](#action)<`string`\> | The type of the actions. |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `initialState?` | `Partial`<[`Document`](#document)<`T`, `A`\>\> & { `data`: `T`  } | The initial state of the document. The `data` property is required, but all other properties are optional. |

#### Returns

[`Document`](#document)<`T`, `A`\>

The new document state.

#### Defined in

[document/utils/base.ts:93](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/utils/base.ts#L93)

___

### createReducer

▸ **createReducer**<`T`, `A`\>(`reducer`, `documentReducer?`): (`state`: [`Document`](#document)<`T`, `BaseAction` \| `A`\>, `action`: `BaseAction` \| `A`) => [`Document`](#document)<`T`, `A`\>

Helper function to create a document model reducer.

**`Remarks`**

This function creates a new reducer that wraps the provided `reducer` with
`documentReducer`, adding support for document actions:
  - `SET_NAME`
  - `UNDO`
  - `REDO`
  - `PRUNE`

It also updates the document-related attributes on every operation.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `unknown` |
| `A` | extends [`Action`](#action)<`string`\> = [`Action`](#action)<`string`\> |

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `reducer` | [`ImmutableReducer`](#immutablereducer)<`T`, `A`\> | `undefined` | The custom reducer to wrap. |
| `documentReducer` | <T, A\>(`state`: [`Document`](#document)<`T`, `A`\>, `action`: `BaseAction` \| `A`, `customReducer`: [`ImmutableReducer`](#immutablereducer)<`T`, `A`\>) => [`Document`](#document)<`T`, `A`\> | `baseReducer` | Base document reducer that wraps a custom document reducer and handles document-level actions such as undo, redo, prune, and set name. |

#### Returns

`fn`

The new reducer.

▸ (`state`, `action`): [`Document`](#document)<`T`, `A`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`Document`](#document)<`T`, `BaseAction` \| `A`\> |
| `action` | `BaseAction` \| `A` |

##### Returns

[`Document`](#document)<`T`, `A`\>

#### Defined in

[document/utils/base.ts:55](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/utils/base.ts#L55)

___

### getLocalFile

▸ **getLocalFile**(`path`): `Promise`<[`DocumentFile`](#documentfile)\>

Reads an attachment from a file and returns its base64-encoded data and MIME type.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `path` | `string` | The path of the attachment file to read. |

#### Returns

`Promise`<[`DocumentFile`](#documentfile)\>

A Promise that resolves to an object containing the base64-encoded data and MIME type of the attachment.

#### Defined in

[document/utils/file.ts:123](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/utils/file.ts#L123)

___

### getRemoteFile

▸ **getRemoteFile**(`url`): `Promise`<[`DocumentFile`](#documentfile)\>

Fetches an attachment from a URL and returns its base64-encoded data and MIME type.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `url` | `string` | The URL of the attachment to fetch. |

#### Returns

`Promise`<[`DocumentFile`](#documentfile)\>

A Promise that resolves to an object containing the base64-encoded data and MIME type of the attachment.

#### Defined in

[document/utils/file.ts:106](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/utils/file.ts#L106)

___

### hashAttachment

▸ **hashAttachment**(`data`): `string`

Returns the SHA1 hash of the given attachment data.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | `string` | The base64-encoded data of the attachment to hash. |

#### Returns

`string`

The hash of the attachment data.

#### Defined in

[document/utils/file.ts:135](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/utils/file.ts#L135)

___

### loadFromFile

▸ **loadFromFile**<`S`, `A`\>(`path`, `reducer`): `Promise`<[`Document`](#document)<`S`, `BaseAction` \| `A`\>\>

Loads a document from a ZIP file.

**`Remarks`**

This function reads a ZIP file and returns the document state after
applying all the operations. The reducer is used to apply the operations.

**`Throws`**

An error if the initial state or the operations history is not found in the ZIP file.

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `S` | `S` | The type of the state object. |
| `A` | extends [`Action`](#action)<`string`\> | The type of the actions that can be applied to the state object. |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `path` | `string` | The path to the ZIP file. |
| `reducer` | [`Reducer`](#reducer)<`S`, `BaseAction` \| `A`\> | The reducer to apply the operations to the state object. |

#### Returns

`Promise`<[`Document`](#document)<`S`, `BaseAction` \| `A`\>\>

A promise that resolves to the document state after applying all the operations.

#### Defined in

[document/utils/file.ts:61](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/utils/file.ts#L61)

___

### saveToFile

▸ **saveToFile**(`document`, `path`, `extension`): `Promise`<`string`\>

Saves a document to a ZIP file.

**`Remarks`**

This function creates a ZIP file containing the document's state, operations,
and file attachments. The file is saved to the specified path.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `document` | [`Document`](#document)<`unknown`, [`Action`](#action)<`string`\>\> | The document to save to the file. |
| `path` | `string` | The path to save the file to. |
| `extension` | `string` | The extension to use for the file. |

#### Returns

`Promise`<`string`\>

A promise that resolves to the path of the saved file.

#### Defined in

[document/utils/file.ts:19](https://github.com/acaldas/document-model-libs/blob/4ee6940/src/document/utils/file.ts#L19)
