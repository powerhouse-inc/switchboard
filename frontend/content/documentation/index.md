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

## Constructors

### constructor

• **new BudgetStatement**(`initialState?`)

Creates a new BudgetStatement instance.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `initialState?` | `Partial`<`Omit`<[`BudgetStatementDocument`](#budgetstatementdocument), ``"data"``\> & { `data`: `Partial`<`BudgetStatementData`\>  }\> | An optional object representing the initial state of the BudgetStatement. |

#### Inherited from

[BaseDocument](#document-base-document).[constructor](#constructor)

#### Defined in

[src/budget-statement/gen/object.ts:45](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/object.ts#L45)

## Properties

### state

• `Protected` **state**: [`Document`](#document)<`BudgetStatementData`, [`BudgetStatementAction`](#budgetstatementaction)\>

#### Inherited from

[BaseDocument](#document-base-document).[state](#state)

#### Defined in

[src/document/object.ts:13](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L13)

___

### fileExtension

▪ `Static` **fileExtension**: `string` = `'phbs'`

The file extension used to save budget statements.

#### Defined in

[src/budget-statement/gen/object.ts:38](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/object.ts#L38)

## Account

### accounts

• `get` **accounts**(): [`Account`](#account)[]

Returns an array of all accounts in the budget statement.

#### Returns

[`Account`](#account)[]

#### Inherited from

AccountObject.accounts

#### Defined in

[src/budget-statement/gen/account/object.ts:69](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/account/object.ts#L69)

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

[src/budget-statement/gen/account/object.ts:29](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/account/object.ts#L29)

___

### deleteAccount

▸ **deleteAccount**(`accounts`): [`BudgetStatement`](#budget-statement-budget-statement)

Deletes one or more accounts from the budget statement.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `accounts` | `string`[] | An array of addresses of the accounts to delete. |

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

AccountObject.deleteAccount

#### Defined in

[src/budget-statement/gen/account/object.ts:50](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/account/object.ts#L50)

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

[src/budget-statement/gen/account/object.ts:79](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/account/object.ts#L79)

___

### sortAccounts

▸ **sortAccounts**(`accounts`): [`BudgetStatement`](#budget-statement-budget-statement)

Sorts the accounts inthe budget statement.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `accounts` | `string`[] | An array of addresses of the accounts to sort. |

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

AccountObject.sortAccounts

#### Defined in

[src/budget-statement/gen/account/object.ts:60](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/account/object.ts#L60)

___

### updateAccount

▸ **updateAccount**(`accounts`): [`BudgetStatement`](#budget-statement-budget-statement)

Updates one or more existing accounts in the budget statement.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `accounts` | `AccountUpdateInput`[] | An array of AccountInput objects to update. |

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

AccountObject.updateAccount

#### Defined in

[src/budget-statement/gen/account/object.ts:40](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/account/object.ts#L40)

## Budget Statement Accessors

### month

• `get` **month**(): `Maybe`<`string`\>

Gets the month of the budget statement.

#### Returns

`Maybe`<`string`\>

#### Inherited from

BaseObject.month

#### Defined in

[src/budget-statement/gen/base/object.ts:18](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/base/object.ts#L18)

___

### owner

• `get` **owner**(): `Maybe`<[`Owner`](#owner)\>

Gets the owner of the budget statement.

#### Returns

`Maybe`<[`Owner`](#owner)\>

#### Inherited from

BaseObject.owner

#### Defined in

[src/budget-statement/gen/base/object.ts:26](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/base/object.ts#L26)

___

### quoteCurrency

• `get` **quoteCurrency**(): `Maybe`<`string`\>

Gets the quote currency of the budget statement.

#### Returns

`Maybe`<`string`\>

#### Inherited from

BaseObject.quoteCurrency

#### Defined in

[src/budget-statement/gen/base/object.ts:34](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/base/object.ts#L34)

___

## Other Accessors

### comments

• `get` **comments**(): [`Comment`](#comment)[]

#### Returns

[`Comment`](#comment)[]

#### Inherited from

CommentObject.comments

#### Defined in

[src/budget-statement/gen/comment/object.ts:22](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/comment/object.ts#L22)

___

### created

• `get` **created**(): `string`

Gets the timestamp of the date the document was created.

#### Returns

`string`

#### Inherited from

AccountObject.created

#### Defined in

[src/document/object.ts:88](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L88)

___

### documentType

• `get` **documentType**(): `string`

Gets the type of document.

#### Returns

`string`

#### Inherited from

AccountObject.documentType

#### Defined in

[src/document/object.ts:81](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L81)

___

### ftes

• `get` **ftes**(): `Maybe`<[`Ftes`](#ftes)\>

#### Returns

`Maybe`<[`Ftes`](#ftes)\>

#### Inherited from

BaseObject.ftes

#### Defined in

[src/budget-statement/gen/base/object.ts:38](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/base/object.ts#L38)

___

### initialState

• `get` **initialState**(): `Omit`<[`Document`](#document)<`T`, `A`\>, ``"initialState"``\>

Gets the initial state of the document.

#### Returns

`Omit`<[`Document`](#document)<`T`, `A`\>, ``"initialState"``\>

#### Inherited from

AccountObject.initialState

#### Defined in

[src/document/object.ts:109](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L109)

___

### lastModified

• `get` **lastModified**(): `string`

Gets the timestamp of the date the document was last modified.

#### Returns

`string`

#### Inherited from

AccountObject.lastModified

#### Defined in

[src/document/object.ts:95](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L95)

___

### name

• `get` **name**(): `string`

Gets the name of the document.

#### Returns

`string`

#### Inherited from

AccountObject.name

#### Defined in

[src/document/object.ts:74](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L74)

___

### operations

• `get` **operations**(): [`Operation`](#operation)<`BaseAction` \| `A`\>[]

Gets the list of operations performed on the document.

#### Returns

[`Operation`](#operation)<`BaseAction` \| `A`\>[]

#### Inherited from

AccountObject.operations

#### Defined in

[src/document/object.ts:116](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L116)

___

### revision

• `get` **revision**(): `number`

Gets the revision number of the document.

#### Returns

`number`

#### Inherited from

AccountObject.revision

#### Defined in

[src/document/object.ts:102](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L102)

___

### vesting

• `get` **vesting**(): [`Vesting`](#vesting)[]

#### Returns

[`Vesting`](#vesting)[]

#### Inherited from

VestingObject.vesting

#### Defined in

[src/budget-statement/gen/vesting/object.ts:26](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/vesting/object.ts#L26)

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

[src/budget-statement/gen/audit/object.ts:21](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/audit/object.ts#L21)

___

### deleteAuditReport

▸ **deleteAuditReport**(`reports`): [`BudgetStatement`](#budget-statement-budget-statement)

Deletes audit reports from the budget statement.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `reports` | `string`[] | An array of objects that contain the report attachment name of the audits items to be deleted. |

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

AuditObject.deleteAuditReport

#### Defined in

[src/budget-statement/gen/audit/object.ts:37](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/audit/object.ts#L37)

___

### getAuditReport

▸ **getAuditReport**(`report`): `undefined` \| [`AuditReport`](#auditreport)

Retrieves a specific audit report from the budget statement.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `report` | `string` | The name of the attachment of the report to be retrieved. |

#### Returns

`undefined` \| [`AuditReport`](#auditreport)

The audit report object if it exists, or undefined if not.

#### Inherited from

AuditObject.getAuditReport

#### Defined in

[src/budget-statement/gen/audit/object.ts:58](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/audit/object.ts#L58)

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

[src/budget-statement/gen/audit/object.ts:47](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/audit/object.ts#L47)

## Methods

### addComment

▸ **addComment**(`comments`): [`BudgetStatement`](#budget-statement-budget-statement)

#### Parameters

| Name | Type |
| :------ | :------ |
| `comments` | [`CommentInput`](#commentinput)[] |

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

CommentObject.addComment

#### Defined in

[src/budget-statement/gen/comment/object.ts:10](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/comment/object.ts#L10)

___

### addVesting

▸ **addVesting**(`vesting`): [`BudgetStatement`](#budget-statement-budget-statement)

#### Parameters

| Name | Type |
| :------ | :------ |
| `vesting` | [`VestingInput`](#vestinginput)[] |

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

VestingObject.addVesting

#### Defined in

[src/budget-statement/gen/vesting/object.ts:14](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/vesting/object.ts#L14)

___

### deleteComment

▸ **deleteComment**(`comments`): [`BudgetStatement`](#budget-statement-budget-statement)

#### Parameters

| Name | Type |
| :------ | :------ |
| `comments` | `string`[] |

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

CommentObject.deleteComment

#### Defined in

[src/budget-statement/gen/comment/object.ts:18](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/comment/object.ts#L18)

___

### deleteVesting

▸ **deleteVesting**(`vesting`): [`BudgetStatement`](#budget-statement-budget-statement)

#### Parameters

| Name | Type |
| :------ | :------ |
| `vesting` | `string`[] |

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

VestingObject.deleteVesting

#### Defined in

[src/budget-statement/gen/vesting/object.ts:22](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/vesting/object.ts#L22)

___

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

[src/document/object.ts:34](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L34)

___

### getAttachment

▸ **getAttachment**(`attachment`): [`DocumentFile`](#documentfile)

Gets the attachment associated with the given key.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `attachment` | `string` | The key of the attachment to retrieve. |

#### Returns

[`DocumentFile`](#documentfile)

#### Inherited from

[BaseDocument](#document-base-document).[getAttachment](#getattachment)

#### Defined in

[src/document/object.ts:124](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L124)

___

### getComment

▸ **getComment**(`key`): `undefined` \| [`Comment`](#comment)

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`undefined` \| [`Comment`](#comment)

#### Inherited from

CommentObject.getComment

#### Defined in

[src/budget-statement/gen/comment/object.ts:26](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/comment/object.ts#L26)

___

### getVesting

▸ **getVesting**(`key`): `undefined` \| [`Vesting`](#vesting)

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`undefined` \| [`Vesting`](#vesting)

#### Inherited from

VestingObject.getVesting

#### Defined in

[src/budget-statement/gen/vesting/object.ts:30](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/vesting/object.ts#L30)

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

[src/budget-statement/gen/object.ts:71](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/object.ts#L71)

___

### loadState

▸ **loadState**(`state`, `operations`): `void`

Loads a document state and a set of operations.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `state` | `Pick`<[`Document`](#document)<`BudgetStatementData`, [`BudgetStatementAction`](#budgetstatementaction)\>, ``"name"`` \| ``"data"``\> | The state to load. |
| `operations` | `number` | The operations to apply to the document. |

#### Returns

`void`

#### Inherited from

[BaseDocument](#document-base-document).[loadState](#loadstate)

#### Defined in

[src/document/object.ts:165](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L165)

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

[src/document/object.ts:156](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L156)

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

[src/document/object.ts:148](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L148)

___

### saveToFile

▸ **saveToFile**(`path`, `name?`): `Promise`<`string`\>

Saves the budget statement to a file.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `path` | `string` | The path to the file to save. |
| `name?` | `string` | - |

#### Returns

`Promise`<`string`\>

A promise that resolves when the save operation completes.

#### Inherited from

[BaseDocument](#document-base-document).[saveToFile](#savetofile)

#### Defined in

[src/budget-statement/gen/object.ts:61](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/object.ts#L61)

___

### setFtes

▸ **setFtes**(`ftes`): [`BudgetStatement`](#budget-statement-budget-statement)

#### Parameters

| Name | Type |
| :------ | :------ |
| `ftes` | [`FtesInput`](#ftesinput) |

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

BaseObject.setFtes

#### Defined in

[src/budget-statement/gen/base/object.ts:54](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/base/object.ts#L54)

___

### setMonth

▸ **setMonth**(`month`): [`BudgetStatement`](#budget-statement-budget-statement)

#### Parameters

| Name | Type |
| :------ | :------ |
| `month` | `string` |

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

BaseObject.setMonth

#### Defined in

[src/budget-statement/gen/base/object.ts:46](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/base/object.ts#L46)

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

[src/document/object.ts:132](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L132)

___

### setOwner

▸ **setOwner**(`owner`): [`BudgetStatement`](#budget-statement-budget-statement)

#### Parameters

| Name | Type |
| :------ | :------ |
| `owner` | [`OwnerInput`](#ownerinput) |

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

BaseObject.setOwner

#### Defined in

[src/budget-statement/gen/base/object.ts:42](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/base/object.ts#L42)

___

### setQuoteCurrency

▸ **setQuoteCurrency**(`currency`): [`BudgetStatement`](#budget-statement-budget-statement)

#### Parameters

| Name | Type |
| :------ | :------ |
| `currency` | `string` |

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

BaseObject.setQuoteCurrency

#### Defined in

[src/budget-statement/gen/base/object.ts:50](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/base/object.ts#L50)

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

[src/document/object.ts:140](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L140)

___

### updateComment

▸ **updateComment**(`comments`): [`BudgetStatement`](#budget-statement-budget-statement)

#### Parameters

| Name | Type |
| :------ | :------ |
| `comments` | `CommentUpdateInput`[] |

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

CommentObject.updateComment

#### Defined in

[src/budget-statement/gen/comment/object.ts:14](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/comment/object.ts#L14)

___

### updateVesting

▸ **updateVesting**(`vesting`): [`BudgetStatement`](#budget-statement-budget-statement)

#### Parameters

| Name | Type |
| :------ | :------ |
| `vesting` | [`VestingUpdateInput`](#vestingupdateinput)[] |

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

VestingObject.updateVesting

#### Defined in

[src/budget-statement/gen/vesting/object.ts:18](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/vesting/object.ts#L18)

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

[src/budget-statement/gen/object.ts:81](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/object.ts#L81)

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

[src/document/object.ts:63](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L63)

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

[src/budget-statement/gen/line-item/object.ts:26](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/line-item/object.ts#L26)

___

### deleteLineItem

▸ **deleteLineItem**(`account`, `lineItems`): [`BudgetStatement`](#budget-statement-budget-statement)

Deletes line items for the specified account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `string` | The address of the account for which line items will be deleted. |
| `lineItems` | `LineItemDeleteInput`[] | An array of objects that contain the category and group of the line items to be deleted. |

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

LineItemObject.deleteLineItem

#### Defined in

[src/budget-statement/gen/line-item/object.ts:54](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/line-item/object.ts#L54)

___

### getLineItem

▸ **getLineItem**(`account`, `lineItem`): `undefined` \| [`LineItem`](#lineitem)

Retrieves a specific line item for the specified account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `string` | The address of the account for which the line item will be retrieved. |
| `lineItem` | `LineItemDeleteInput` | An object that contains the category and group of the line item to be retrieved. |

#### Returns

`undefined` \| [`LineItem`](#lineitem)

The line item object that matches the specified category and group, or undefined if it does not exist.

#### Inherited from

LineItemObject.getLineItem

#### Defined in

[src/budget-statement/gen/line-item/object.ts:96](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/line-item/object.ts#L96)

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

[src/budget-statement/gen/line-item/object.ts:82](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/line-item/object.ts#L82)

___

### sortLineItems

▸ **sortLineItems**(`account`, `lineItems`): [`BudgetStatement`](#budget-statement-budget-statement)

Sorts the line items of an account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `string` | The account containing the line items to sort. |
| `lineItems` | `LineItemsSortInput`[] | An array of line items to sort. |

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

LineItemObject.sortLineItems

#### Defined in

[src/budget-statement/gen/line-item/object.ts:68](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/line-item/object.ts#L68)

___

### updateLineItem

▸ **updateLineItem**(`account`, `lineItems`): [`BudgetStatement`](#budget-statement-budget-statement)

Updates line items for the specified account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `string` | The address of the account for which line items will be updated. |
| `lineItems` | `LineItemUpdateInput`[] | An array of line item input objects to be updated. |

#### Returns

[`BudgetStatement`](#budget-statement-budget-statement)

#### Inherited from

LineItemObject.updateLineItem

#### Defined in

[src/budget-statement/gen/line-item/object.ts:40](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/line-item/object.ts#L40)

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

[src/document/object.ts:21](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L21)

## Properties

### reducer

• `Private` **reducer**: [`Reducer`](#reducer)<`T`, `BaseAction` \| `A`\>

#### Defined in

[src/document/object.ts:14](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L14)

___

### state

• `Protected` **state**: [`Document`](#document)<`T`, `A`\>

#### Defined in

[src/document/object.ts:13](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L13)

## Accessors

### created

• `get` **created**(): `string`

Gets the timestamp of the date the document was created.

#### Returns

`string`

#### Defined in

[src/document/object.ts:88](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L88)

___

### documentType

• `get` **documentType**(): `string`

Gets the type of document.

#### Returns

`string`

#### Defined in

[src/document/object.ts:81](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L81)

___

### initialState

• `get` **initialState**(): `Omit`<[`Document`](#document)<`T`, `A`\>, ``"initialState"``\>

Gets the initial state of the document.

#### Returns

`Omit`<[`Document`](#document)<`T`, `A`\>, ``"initialState"``\>

#### Defined in

[src/document/object.ts:109](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L109)

___

### lastModified

• `get` **lastModified**(): `string`

Gets the timestamp of the date the document was last modified.

#### Returns

`string`

#### Defined in

[src/document/object.ts:95](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L95)

___

### name

• `get` **name**(): `string`

Gets the name of the document.

#### Returns

`string`

#### Defined in

[src/document/object.ts:74](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L74)

___

### operations

• `get` **operations**(): [`Operation`](#operation)<`BaseAction` \| `A`\>[]

Gets the list of operations performed on the document.

#### Returns

[`Operation`](#operation)<`BaseAction` \| `A`\>[]

#### Defined in

[src/document/object.ts:116](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L116)

___

### revision

• `get` **revision**(): `number`

Gets the revision number of the document.

#### Returns

`number`

#### Defined in

[src/document/object.ts:102](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L102)

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

[src/document/object.ts:34](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L34)

___

### getAttachment

▸ **getAttachment**(`attachment`): [`DocumentFile`](#documentfile)

Gets the attachment associated with the given key.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `attachment` | `string` | The key of the attachment to retrieve. |

#### Returns

[`DocumentFile`](#documentfile)

#### Defined in

[src/document/object.ts:124](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L124)

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

[src/document/object.ts:53](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L53)

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

[src/document/object.ts:165](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L165)

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

[src/document/object.ts:156](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L156)

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

[src/document/object.ts:148](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L148)

___

### saveToFile

▸ `Protected` **saveToFile**(`path`, `extension`, `name?`): `Promise`<`string`\>

Saves the state of the document to a file.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `path` | `string` | The file path where the state should be saved. |
| `extension` | `string` | The file extension to use when saving the state. |
| `name?` | `string` | - |

#### Returns

`Promise`<`string`\>

The file path where the state was saved.

#### Defined in

[src/document/object.ts:45](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L45)

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

[src/document/object.ts:132](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L132)

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

[src/document/object.ts:140](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L140)

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

[src/document/object.ts:63](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L63)

# Modules

[@acaldas/document-model-libs](#readme) / Exports

# @acaldas/document-model-libs

## Namespaces

- [BudgetStatement](#budget-statement)
- [Document](#document)

## Variables

### default

• **default**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `BudgetStatement` | [`BudgetStatement`](#budget-statement) |
| `Document` | [`Document`](#document) |

#### Defined in

[src/index.doc.ts:35](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/index.doc.ts#L35)

# Budget Statement Actions

[@acaldas/document-model-libs](#readme) / [Exports](#modules) / [BudgetStatement](#budget-statement) / actions

# Namespace: actions

[BudgetStatement](#budget-statement).actions

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

[src/budget-statement/gen/account/creators.ts:25](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/account/creators.ts#L25)

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

[src/budget-statement/gen/account/creators.ts:51](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/account/creators.ts#L51)

___

### sortAccounts

▸ **sortAccounts**(`accounts`): `SortAccountsAction`

Action creator for sorting accounts in the budget statement.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `accounts` | `string`[] | Array of addresses of the accounts to sort. |

#### Returns

`SortAccountsAction`

#### Defined in

[src/budget-statement/gen/account/creators.ts:63](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/account/creators.ts#L63)

___

### updateAccount

▸ **updateAccount**(`accounts`): `UpdateAccountAction`

Action creator for updating accounts in the budget statement.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `accounts` | `AccountUpdateInput`[] | Array of account inputs to be updated. |

#### Returns

`UpdateAccountAction`

#### Defined in

[src/budget-statement/gen/account/creators.ts:39](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/account/creators.ts#L39)

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

[src/budget-statement/gen/audit/creators.ts:22](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/audit/creators.ts#L22)

___

### deleteAuditReport

▸ **deleteAuditReport**(`reports`): `DeleteAuditReportAction`

Creates an action to delete one or more audit reports from the state.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `reports` | `string`[] | An array of reports to be deleted. |

#### Returns

`DeleteAuditReportAction`

The created action.

#### Defined in

[src/budget-statement/gen/audit/creators.ts:51](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/audit/creators.ts#L51)

## Functions

### addComment

▸ **addComment**(`comments`): `AddCommentAction`

#### Parameters

| Name | Type |
| :------ | :------ |
| `comments` | [`CommentInput`](#commentinput)[] |

#### Returns

`AddCommentAction`

#### Defined in

[src/budget-statement/gen/comment/creators.ts:16](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/comment/creators.ts#L16)

___

### addVesting

▸ **addVesting**(`vesting`): `AddVestingAction`

#### Parameters

| Name | Type |
| :------ | :------ |
| `vesting` | [`VestingInput`](#vestinginput)[] |

#### Returns

`AddVestingAction`

#### Defined in

[src/budget-statement/gen/vesting/creators.ts:13](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/vesting/creators.ts#L13)

___

### deleteComment

▸ **deleteComment**(`comments`): `DeleteCommentAction`

#### Parameters

| Name | Type |
| :------ | :------ |
| `comments` | `string`[] |

#### Returns

`DeleteCommentAction`

#### Defined in

[src/budget-statement/gen/comment/creators.ts:30](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/comment/creators.ts#L30)

___

### deleteVesting

▸ **deleteVesting**(`vesting`): `DeleteVestingAction`

#### Parameters

| Name | Type |
| :------ | :------ |
| `vesting` | `string`[] |

#### Returns

`DeleteVestingAction`

#### Defined in

[src/budget-statement/gen/vesting/creators.ts:27](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/vesting/creators.ts#L27)

___

### setFtes

▸ **setFtes**(`ftes`): `SetFtesAction`

#### Parameters

| Name | Type |
| :------ | :------ |
| `ftes` | [`FtesInput`](#ftesinput) |

#### Returns

`SetFtesAction`

#### Defined in

[src/budget-statement/gen/base/creators.ts:28](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/base/creators.ts#L28)

___

### setMonth

▸ **setMonth**(`month`): `SetMonthAction`

#### Parameters

| Name | Type |
| :------ | :------ |
| `month` | `string` |

#### Returns

`SetMonthAction`

#### Defined in

[src/budget-statement/gen/base/creators.ts:18](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/base/creators.ts#L18)

___

### setOwner

▸ **setOwner**(`owner`): `SetOwnerAction`

#### Parameters

| Name | Type |
| :------ | :------ |
| `owner` | [`OwnerInput`](#ownerinput) |

#### Returns

`SetOwnerAction`

#### Defined in

[src/budget-statement/gen/base/creators.ts:15](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/base/creators.ts#L15)

___

### setQuoteCurrency

▸ **setQuoteCurrency**(`currency`): `SetQuoteCurrencyAction`

#### Parameters

| Name | Type |
| :------ | :------ |
| `currency` | `string` |

#### Returns

`SetQuoteCurrencyAction`

#### Defined in

[src/budget-statement/gen/base/creators.ts:21](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/base/creators.ts#L21)

___

### updateComment

▸ **updateComment**(`comments`): `UpdateCommentAction`

#### Parameters

| Name | Type |
| :------ | :------ |
| `comments` | `CommentUpdateInput`[] |

#### Returns

`UpdateCommentAction`

#### Defined in

[src/budget-statement/gen/comment/creators.ts:23](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/comment/creators.ts#L23)

___

### updateVesting

▸ **updateVesting**(`vesting`): `UpdateVestingAction`

#### Parameters

| Name | Type |
| :------ | :------ |
| `vesting` | [`VestingUpdateInput`](#vestingupdateinput)[] |

#### Returns

`UpdateVestingAction`

#### Defined in

[src/budget-statement/gen/vesting/creators.ts:20](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/vesting/creators.ts#L20)

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

[src/budget-statement/gen/line-item/creators.ts:29](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/line-item/creators.ts#L29)

___

### deleteLineItem

▸ **deleteLineItem**(`account`, `lineItems`): `DeleteLineItemAction`

Creates an action to delete one or more line items from an account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `string` | The account containing the line items to delete. |
| `lineItems` | `LineItemDeleteInput`[] | An array of line items to delete from the account. |

#### Returns

`DeleteLineItemAction`

#### Defined in

[src/budget-statement/gen/line-item/creators.ts:69](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/line-item/creators.ts#L69)

___

### sortLineItems

▸ **sortLineItems**(`account`, `lineItems`): `SortLineItemsAction`

Creates an action to sort the line items of an account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `string` | The account containing the line items to sort. |
| `lineItems` | `LineItemsSortInput`[] | An array of line items to sort. |

#### Returns

`SortLineItemsAction`

#### Defined in

[src/budget-statement/gen/line-item/creators.ts:89](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/line-item/creators.ts#L89)

___

### updateLineItem

▸ **updateLineItem**(`account`, `lineItems`): `UpdateLineItemAction`

Creates an action to update one or more line items in an account.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `account` | `string` | The account containing the line items to update. |
| `lineItems` | `LineItemUpdateInput`[] | An array of line items to update in the account. |

#### Returns

`UpdateLineItemAction`

#### Defined in

[src/budget-statement/gen/line-item/creators.ts:49](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/gen/line-item/creators.ts#L49)

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

## Namespaces

- [actions](#budget-statement-actions)
- [utils](#budget-statement-utils)

## Classes

- [BudgetStatement](#budget-statement-budget-statement)

## Type Aliases

### Account

Ƭ **Account**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `__typename?` | ``"Account"`` |
| `address` | `Scalars`[``"String"``] |
| `lineItems` | [`LineItem`](#lineitem)[] |
| `name` | `Scalars`[``"String"``] |

#### Defined in

node_modules/@acaldas/document-model-graphql/dist/budget-statement/types.d.ts:29

___

### AccountInput

Ƭ **AccountInput**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `address` | `Scalars`[``"String"``] |
| `lineItems?` | `InputMaybe`<[`LineItemInput`](#lineiteminput)[]\> |
| `name?` | `InputMaybe`<`Scalars`[``"String"``]\> |

#### Defined in

node_modules/@acaldas/document-model-graphql/dist/budget-statement/types.d.ts:35

___

### AuditReport

Ƭ **AuditReport**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `__typename?` | ``"AuditReport"`` |
| `report` | `Scalars`[``"String"``] |
| `status` | [`AuditReportStatus`](#auditreportstatus) \| \`${AuditReportStatus}\` |
| `timestamp` | `Scalars`[``"DateTime"``] |

#### Defined in

node_modules/@acaldas/document-model-graphql/dist/budget-statement/types.d.ts:81

___

### AuditReportInput

Ƭ **AuditReportInput**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `report` | `DocumentFileInput` |
| `status` | [`AuditReportStatus`](#auditreportstatus) \| \`${AuditReportStatus}\` |
| `timestamp?` | `InputMaybe`<`Scalars`[``"DateTime"``]\> |

#### Defined in

node_modules/@acaldas/document-model-graphql/dist/budget-statement/types.d.ts:87

___

### AuditReportStatus

Ƭ **AuditReportStatus**: ``"Approved"`` \| ``"ApprovedWithComments"`` \| ``"Escalated"`` \| ``"NeedsAction"``

#### Defined in

node_modules/@acaldas/document-model-graphql/dist/budget-statement/types.d.ts:92

___

### BudgetStatementAction

Ƭ **BudgetStatementAction**: `AddAccountAction` \| `AddAuditReportAction` \| `AddCommentAction` \| `AddLineItemAction` \| `AddVestingAction` \| `DeleteAccountAction` \| `DeleteAuditReportAction` \| `DeleteCommentAction` \| `DeleteLineItemAction` \| `DeleteVestingAction` \| `SetFtesAction` \| `SetMonthAction` \| `SetOwnerAction` \| `SetQuoteCurrencyAction` \| `SortAccountsAction` \| `SortLineItemsAction` \| `UpdateAccountAction` \| `UpdateCommentAction` \| `UpdateLineItemAction` \| `UpdateVestingAction`

#### Defined in

node_modules/@acaldas/document-model-graphql/dist/budget-statement/types.d.ts:104

___

### BudgetStatementDocument

Ƭ **BudgetStatementDocument**: [`Document`](#document)<[`State`](#state), [`BudgetStatementAction`](#budgetstatementaction)\>

Represents a budget statement document, which extends the base Document type.

#### Defined in

[src/budget-statement/custom/types.ts:53](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/custom/types.ts#L53)

___

### BudgetStatus

Ƭ **BudgetStatus**: ``"Draft"`` \| ``"Escalated"`` \| ``"Final"`` \| ``"Review"``

#### Defined in

node_modules/@acaldas/document-model-graphql/dist/budget-statement/types.d.ts:134

___

### Comment

Ƭ **Comment**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `__typename?` | ``"Comment"`` |
| `author` | `CommentAuthor` |
| `comment` | `Scalars`[``"String"``] |
| `key` | `Scalars`[``"String"``] |
| `status` | [`BudgetStatus`](#budgetstatus) \| \`${BudgetStatus}\` |
| `timestamp` | `Scalars`[``"DateTime"``] |

#### Defined in

node_modules/@acaldas/document-model-graphql/dist/budget-statement/types.d.ts:135

___

### CommentInput

Ƭ **CommentInput**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `author?` | `InputMaybe`<`CommentAuthorInput`\> |
| `comment` | `Scalars`[``"String"``] |
| `key?` | `InputMaybe`<`Scalars`[``"String"``]\> |
| `status?` | `InputMaybe`<[`BudgetStatus`](#budgetstatus) \| \`${BudgetStatus}\`\> |
| `timestamp?` | `InputMaybe`<`Scalars`[``"DateTime"``]\> |

#### Defined in

node_modules/@acaldas/document-model-graphql/dist/budget-statement/types.d.ts:156

___

### Ftes

Ƭ **Ftes**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `__typename?` | ``"Ftes"`` |
| `forecast` | `FtesForecast`[] |
| `value` | `Scalars`[``"Float"``] |

#### Defined in

node_modules/@acaldas/document-model-graphql/dist/budget-statement/types.d.ts:217

___

### FtesInput

Ƭ **FtesInput**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `forecast` | `FtesForecastInput`[] |
| `value` | `Scalars`[``"Float"``] |

#### Defined in

node_modules/@acaldas/document-model-graphql/dist/budget-statement/types.d.ts:231

___

### LineItem

Ƭ **LineItem**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `__typename?` | ``"LineItem"`` |
| `actual` | `Maybe`<`Scalars`[``"Float"``]\> |
| `budgetCap` | `Maybe`<`Scalars`[``"Float"``]\> |
| `category` | `Maybe`<`LineItemCategory`\> |
| `comment` | `Maybe`<`Scalars`[``"String"``]\> |
| `forecast` | `LineItemForecast`[] |
| `group` | `Maybe`<`LineItemGroup`\> |
| `headcountExpense` | `Scalars`[``"Boolean"``] |
| `payment` | `Maybe`<`Scalars`[``"Float"``]\> |

#### Defined in

node_modules/@acaldas/document-model-graphql/dist/budget-statement/types.d.ts:250

___

### LineItemInput

Ƭ **LineItemInput**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `actual?` | `InputMaybe`<`Scalars`[``"Float"``]\> |
| `budgetCap?` | `InputMaybe`<`Scalars`[``"Float"``]\> |
| `category?` | `InputMaybe`<`LineItemCategory`\> |
| `comment?` | `InputMaybe`<`Scalars`[``"String"``]\> |
| `forecast?` | `InputMaybe`<`LineItemForecast`[]\> |
| `group?` | `InputMaybe`<`LineItemGroup`\> |
| `headcountExpense?` | `InputMaybe`<`Scalars`[``"Boolean"``]\> |
| `payment?` | `InputMaybe`<`Scalars`[``"Float"``]\> |

#### Defined in

node_modules/@acaldas/document-model-graphql/dist/budget-statement/types.d.ts:283

___

### Owner

Ƭ **Owner**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `__typename?` | ``"Owner"`` |
| `id` | `Maybe`<`Scalars`[``"String"``]\> |
| `ref` | `Maybe`<`Scalars`[``"String"``]\> |
| `title` | `Maybe`<`Scalars`[``"String"``]\> |

#### Defined in

node_modules/@acaldas/document-model-graphql/dist/budget-statement/types.d.ts:421

___

### OwnerInput

Ƭ **OwnerInput**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `id?` | `InputMaybe`<`Scalars`[``"String"``]\> |
| `ref?` | `InputMaybe`<`Scalars`[``"String"``]\> |
| `title?` | `InputMaybe`<`Scalars`[``"String"``]\> |

#### Defined in

node_modules/@acaldas/document-model-graphql/dist/budget-statement/types.d.ts:427

___

### State

Ƭ **State**: `BudgetStatementData`

Represents the state of a budget statement.

#### Defined in

[src/budget-statement/custom/types.ts:48](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/custom/types.ts#L48)

___

### Vesting

Ƭ **Vesting**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `__typename?` | ``"Vesting"`` |
| `amount` | `Scalars`[``"String"``] |
| `amountOld` | `Scalars`[``"String"``] |
| `comment` | `Scalars`[``"String"``] |
| `currency` | `Scalars`[``"String"``] |
| `date` | `Scalars`[``"String"``] |
| `key` | `Scalars`[``"String"``] |
| `vested` | `Scalars`[``"Boolean"``] |

#### Defined in

node_modules/@acaldas/document-model-graphql/dist/budget-statement/types.d.ts:539

___

### VestingInput

Ƭ **VestingInput**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `amount?` | `InputMaybe`<`Scalars`[``"String"``]\> |
| `amountOld?` | `InputMaybe`<`Scalars`[``"String"``]\> |
| `comment?` | `InputMaybe`<`Scalars`[``"String"``]\> |
| `currency?` | `InputMaybe`<`Scalars`[``"String"``]\> |
| `date?` | `InputMaybe`<`Scalars`[``"String"``]\> |
| `key?` | `InputMaybe`<`Scalars`[``"String"``]\> |
| `vested?` | `InputMaybe`<`Scalars`[``"Boolean"``]\> |

#### Defined in

node_modules/@acaldas/document-model-graphql/dist/budget-statement/types.d.ts:549

___

### VestingUpdateInput

Ƭ **VestingUpdateInput**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `amount?` | `InputMaybe`<`Scalars`[``"String"``]\> |
| `amountOld?` | `InputMaybe`<`Scalars`[``"String"``]\> |
| `comment?` | `InputMaybe`<`Scalars`[``"String"``]\> |
| `currency?` | `InputMaybe`<`Scalars`[``"String"``]\> |
| `date?` | `InputMaybe`<`Scalars`[``"String"``]\> |
| `key` | `Scalars`[``"String"``] |
| `vested?` | `InputMaybe`<`Scalars`[``"Boolean"``]\> |

#### Defined in

node_modules/@acaldas/document-model-graphql/dist/budget-statement/types.d.ts:558

## Functions

### reducer

▸ **reducer**(`state`, `action`): [`Document`](#document)<`BudgetStatementData`, [`BudgetStatementAction`](#budgetstatementaction)\>

Reducer for the BudgetStatement module, which handles operations related to budget statements.

**`Remarks`**

This reducer handles the following actions:
- `INIT`: initializes the state of the module.
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
- `ADD_AUDIT_REPORT`: adds an audit report to an account in the state.
- `DELETE_AUDIT_REPORT`: removes an audit report from an account in the state.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `state` | [`Document`](#document)<`BudgetStatementData`, `BaseAction` \| [`BudgetStatementAction`](#budgetstatementaction)\> | The current state of the module. |
| `action` | `BaseAction` \| [`BudgetStatementAction`](#budgetstatementaction) | The action to be performed on the state. |

#### Returns

[`Document`](#document)<`BudgetStatementData`, [`BudgetStatementAction`](#budgetstatementaction)\>

The new state after applying the action.

#### Defined in

[src/document/utils/base.ts:64](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/utils/base.ts#L64)

# Budget Statement Utils

[@acaldas/document-model-libs](#readme) / [Exports](#modules) / [BudgetStatement](#budget-statement) / utils

# Namespace: utils

[BudgetStatement](#budget-statement).utils

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

[src/budget-statement/custom/utils.ts:60](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/custom/utils.ts#L60)

___

### createBudgetStatement

▸ **createBudgetStatement**(`initialState?`): [`BudgetStatementDocument`](#budgetstatementdocument)

Creates a new BudgetStatement document with an initial state.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `initialState?` | `Partial`<`Omit`<[`BudgetStatementDocument`](#budgetstatementdocument), ``"data"``\> & { `data`: `Partial`<`BudgetStatementData`\>  }\> | The initial state of the document. |

#### Returns

[`BudgetStatementDocument`](#budgetstatementdocument)

The new BudgetStatement document.

#### Defined in

[src/budget-statement/custom/utils.ts:28](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/custom/utils.ts#L28)

___

### createLineItem

▸ **createLineItem**(`input`): [`LineItem`](#lineitem)

Creates a new LineItem with default properties and the given input properties.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | [`LineItemInput`](#lineiteminput) | The input properties of the line item. |

#### Returns

[`LineItem`](#lineitem)

The new LineItem object.

#### Defined in

[src/budget-statement/custom/utils.ts:71](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/custom/utils.ts#L71)

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

[src/budget-statement/custom/utils.ts:104](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/custom/utils.ts#L104)

___

### loadBudgetStatementFromInput

▸ **loadBudgetStatementFromInput**(`input`): `Promise`<[`BudgetStatementDocument`](#budgetstatementdocument)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `FileInput` |

#### Returns

`Promise`<[`BudgetStatementDocument`](#budgetstatementdocument)\>

#### Defined in

[src/budget-statement/custom/utils.ts:141](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/custom/utils.ts#L141)

___

### saveBudgetStatementToFile

▸ **saveBudgetStatementToFile**(`document`, `path`, `name?`): `Promise`<`string`\>

Saves the BudgetStatement document to the specified file path.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `document` | [`BudgetStatementDocument`](#budgetstatementdocument) | The BudgetStatement document to save. |
| `path` | `string` | The file path to save the document to. |
| `name?` | `string` | - |

#### Returns

`Promise`<`string`\>

A promise that resolves with the saved file path.

#### Defined in

[src/budget-statement/custom/utils.ts:91](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/custom/utils.ts#L91)

___

### saveBudgetStatementToFileHandle

▸ **saveBudgetStatementToFileHandle**(`document`, `input`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `document` | [`BudgetStatementDocument`](#budgetstatementdocument) |
| `input` | `FileSystemFileHandle` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/budget-statement/custom/utils.ts:177](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/budget-statement/custom/utils.ts#L177)

# Document Actions

[@acaldas/document-model-libs](#readme) / [Exports](#modules) / [Document](#document) / actions

# Namespace: actions

[Document](#document).actions

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

[src/document/actions/creators.ts:63](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/actions/creators.ts#L63)

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

[src/document/actions/creators.ts:50](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/actions/creators.ts#L50)

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

[src/document/actions/creators.ts:36](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/actions/creators.ts#L36)

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

[src/document/actions/creators.ts:18](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/actions/creators.ts#L18)

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

[src/document/actions/creators.ts:27](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/actions/creators.ts#L27)

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

## Namespaces

- [actions](#document-actions)
- [utils](#document-utils)

## Classes

- [BaseDocument](#document-base-document)

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

[src/document/types.ts:9](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/types.ts#L9)

___

### Attachment

Ƭ **Attachment**: `string`

String type representing an attachment in a Document.

**`Remarks`**

Attachment string is formatted as `attachment://<filename>`.

#### Defined in

[src/document/types.ts:133](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/types.ts#L133)

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

[src/document/types.ts:113](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/types.ts#L113)

___

### DocumentFile

Ƭ **DocumentFile**: `Object`

The attributes stored for a file. Namely, attachments of a document.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | `string` | The binary data of the attachment in Base64 |
| `extension?` | `string` \| ``null`` | - |
| `fileName?` | `string` \| ``null`` | - |
| `mimeType` | `string` | The MIME type of the attachment |

#### Defined in

[src/document/types.ts:83](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/types.ts#L83)

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

[src/document/types.ts:67](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/types.ts#L67)

___

### FileRegistry

Ƭ **FileRegistry**: `Record`<[`Attachment`](#attachment), [`DocumentFile`](#documentfile)\>

Object that indexes attachments of a Document.

**`Remarks`**

This is used to reduce memory usage to avoid
multiple instances of the binary data of the attachments.

#### Defined in

[src/document/types.ts:102](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/types.ts#L102)

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

[src/document/types.ts:40](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/types.ts#L40)

___

### Operation

Ƭ **Operation**<`A`\>: `A` & { `hash`: `string` ; `index`: `number` ; `timestamp`: `string`  }

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

[src/document/types.ts:55](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/types.ts#L55)

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

[src/document/types.ts:23](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/types.ts#L23)

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

[src/document/object.ts:183](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/object.ts#L183)

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

[src/document/reducer.ts:157](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/reducer.ts#L157)

# Document Utils

[@acaldas/document-model-libs](#readme) / [Exports](#modules) / [Document](#document) / utils

# Namespace: utils

[Document](#document).utils

## Functions

### createAction

▸ **createAction**<`A`\>(`type`, `input?`, `validator?`): `A`

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
| `input?` | `A`[``"input"``] | The input properties of the action. |
| `validator?` | () => { `parse`: (`v`: `unknown`) => `A`  } | - |

#### Returns

`A`

The new action.

#### Defined in

[src/document/utils/base.ts:23](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/utils/base.ts#L23)

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

[src/document/utils/base.ts:80](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/utils/base.ts#L80)

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

[src/document/utils/base.ts:60](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/utils/base.ts#L60)

___

### createZip

▸ **createZip**(`document`): `Promise`<`JSZip`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `document` | [`Document`](#document)<`unknown`, [`Action`](#action)<`string`\>\> |

#### Returns

`Promise`<`JSZip`\>

#### Defined in

[src/document/utils/file.ts:17](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/utils/file.ts#L17)

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

[src/document/utils/file.ts:191](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/utils/file.ts#L191)

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

[src/document/utils/file.ts:174](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/utils/file.ts#L174)

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

[src/document/utils/file.ts:203](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/utils/file.ts#L203)

___

### hashDocument

▸ **hashDocument**(`state`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | [`Document`](#document)<`unknown`, [`Action`](#action)<`string`\>\> |

#### Returns

`string`

#### Defined in

[src/document/utils/base.ts:103](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/utils/base.ts#L103)

___

### hashKey

▸ **hashKey**(`date?`, `randomLimit?`): `string`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `date?` | `Date` | `undefined` |
| `randomLimit` | `number` | `1000` |

#### Returns

`string`

#### Defined in

[src/document/utils/base.ts:107](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/utils/base.ts#L107)

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

[src/document/utils/file.ts:100](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/utils/file.ts#L100)

___

### loadFromInput

▸ **loadFromInput**<`S`, `A`\>(`input`, `reducer`): `Promise`<[`Document`](#document)<`S`, `BaseAction` \| `A`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S` |
| `A` | extends [`Action`](#action)<`string`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `FileInput` |
| `reducer` | [`Reducer`](#reducer)<`S`, `BaseAction` \| `A`\> |

#### Returns

`Promise`<[`Document`](#document)<`S`, `BaseAction` \| `A`\>\>

#### Defined in

[src/document/utils/file.ts:108](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/utils/file.ts#L108)

___

### saveToFile

▸ **saveToFile**(`document`, `path`, `extension`, `name?`): `Promise`<`string`\>

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
| `name?` | `string` | - |

#### Returns

`Promise`<`string`\>

A promise that resolves to the path of the saved file.

#### Defined in

[src/document/utils/file.ts:61](https://github.com/acaldas/document-model-libs/blob/3a0f0da/src/document/utils/file.ts#L61)
