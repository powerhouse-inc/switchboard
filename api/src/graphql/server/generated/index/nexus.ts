/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */


import type { Context } from "./../../index/context"
import type { FieldAuthorizeResolver } from "nexus/dist/plugins/fieldAuthorizePlugin"
import type { core, connectionPluginCore } from "nexus"
import type { ArgsValidationConfig, HasTypeField } from "nexus-validation-plugin/utils"
declare global {
  interface NexusGenCustomInputMethods<TypeName extends string> {
    /**
     * Date custom scalar type
     */
    date<FieldName extends string>(fieldName: FieldName, opts?: core.CommonInputFieldConfig<TypeName, FieldName>): void // "Date";
    /**
     * Attachment custom scalar type
     */
    attachment<FieldName extends string>(fieldName: FieldName, opts?: core.CommonInputFieldConfig<TypeName, FieldName>): void // "Attachment";
  }
}
declare global {
  interface NexusGenCustomOutputMethods<TypeName extends string> {
    /**
     * Date custom scalar type
     */
    date<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "Date";
    /**
     * Attachment custom scalar type
     */
    attachment<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "Attachment";
    /**
     * Adds a Relay-style connection to the type, with numerous options for configuration
     *
     * @see https://nexusjs.org/docs/plugins/connection
     */
    connectionField<FieldName extends string>(
      fieldName: FieldName,
      config: connectionPluginCore.ConnectionFieldConfig<TypeName, FieldName>
    ): void
  }
}


declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
  DocumentDriveLocalStateInput: { // input type
    availableOffline: boolean; // Boolean!
    sharingType?: string | null; // String
  }
  DocumentDriveStateInput: { // input type
    icon?: string | null; // String
    id?: string | null; // ID
    name: string; // String!
    slug?: string | null; // String
  }
  SessionInput: { // input type
    allowedOrigins: string; // String!
    expiryDurationSeconds?: number | null; // Int
    name: string; // String!
  }
  SetDriveIconInput: { // input type
    icon: string; // String!
  }
}

export interface NexusGenEnums {
  TransmitterType: "Internal" | "MatrixConnect" | "PullResponder" | "RESTWebhook" | "SecureConnect" | "SwitchboardPush"
  TriggerType: "PullResponder"
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
  Attachment: any
  Date: any
  Unknown: any
}

export interface NexusGenObjects {
  AddDriveResponse: { // root type
    global: NexusGenRootTypes['DocumentDriveState']; // DocumentDriveState!
    local: NexusGenRootTypes['DocumentDriveLocalState']; // DocumentDriveLocalState!
  }
  Auth: {};
  Challenge: { // root type
    hex: string; // String!
    message: string; // String!
    nonce: string; // String!
  }
  CoreUnit: { // root type
    code?: string | null; // String
    descriptionParagraph?: string | null; // String
    descriptionParagraphImageSource?: string | null; // String
    descriptionSentence?: string | null; // String
    id?: string | null; // String
    imageSource?: string | null; // String
    name?: string | null; // String
    shortCode?: string | null; // String
  }
  DefaultOperation: { // root type
    error?: string | null; // String
    hash: string; // String!
    id?: string | null; // String
    index: number; // Int!
    inputText: string; // String!
    skip: number; // Int!
    timestamp: NexusGenScalars['Date']; // Date!
    type: string; // String!
  }
  DocumentDrive: { // root type
    created: NexusGenScalars['Date']; // Date!
    documentType: string; // String!
    id: string; // String!
    initialState: NexusGenRootTypes['DocumentDriveState']; // DocumentDriveState!
    lastModified: NexusGenScalars['Date']; // Date!
    name: string; // String!
    revision: number; // Int!
    state: NexusGenRootTypes['DocumentDriveState']; // DocumentDriveState!
  }
  DocumentDriveLocalState: { // root type
    availableOffline: boolean; // Boolean!
    listeners: NexusGenRootTypes['Listener'][]; // [Listener!]!
    sharingType?: string | null; // String
    triggers: NexusGenRootTypes['Trigger'][]; // [Trigger!]!
  }
  DocumentDriveState: { // root type
    icon?: string | null; // String
    id: string; // ID!
    name: string; // String!
    nodes: NexusGenRootTypes['Node'][]; // [Node!]!
    slug?: string | null; // String
  }
  FileNode: { // root type
    documentType: string; // String!
    id: string; // String!
    kind: string; // String!
    name: string; // String!
    parentFolder?: string | null; // String
    synchronizationUnits: NexusGenRootTypes['SynchronizationUnit'][]; // [SynchronizationUnit!]!
  }
  FolderNode: { // root type
    id: string; // String!
    kind: string; // String!
    name: string; // String!
    parentFolder?: string | null; // String
  }
  Listener: { // root type
    block: boolean; // Boolean!
    callInfo?: NexusGenRootTypes['ListenerCallInfo'] | null; // ListenerCallInfo
    filter: NexusGenRootTypes['ListenerFilter']; // ListenerFilter!
    label?: string | null; // String
    listenerId: string; // ID!
    system: boolean; // Boolean!
  }
  ListenerCallInfo: { // root type
    data?: string | null; // String
    name?: string | null; // String
    transmitterType?: NexusGenEnums['TransmitterType'] | null; // TransmitterType
  }
  ListenerFilter: { // root type
    branch?: string[] | null; // [String!]
    documentId?: string[] | null; // [ID!]
    documentType: string[]; // [String!]!
    scope?: string[] | null; // [String!]
  }
  Mutation: {};
  PullResponderTriggerData: { // root type
    interval: string; // String!
    listenerId: string; // ID!
    url: string; // String!
  }
  Query: {};
  Session: { // root type
    allowedOrigins?: string | null; // String
    createdAt: NexusGenScalars['Date']; // Date!
    createdBy: string; // String!
    id: string; // String!
    isUserCreated: boolean; // Boolean!
    name?: string | null; // String
    referenceExpiryDate?: NexusGenScalars['Date'] | null; // Date
    referenceTokenId: string; // String!
    revokedAt?: NexusGenScalars['Date'] | null; // Date
  }
  SessionOutput: { // root type
    session: NexusGenRootTypes['Session']; // Session!
    token: string; // String!
  }
  SwitchboardHost: {};
  SynchronizationUnit: { // root type
    branch: string; // String!
    scope: string; // String!
    syncId: string; // ID!
  }
  Trigger: { // root type
    data?: NexusGenRootTypes['TriggerData'] | null; // TriggerData
    id: string; // ID!
    type: NexusGenEnums['TriggerType']; // TriggerType!
  }
  User: { // root type
    address: string; // String!
    createdAt: NexusGenScalars['Date']; // Date!
  }
}

export interface NexusGenInterfaces {
  IDocument: NexusGenRootTypes['DocumentDrive'];
  IOperation: NexusGenRootTypes['DefaultOperation'];
  Node: NexusGenRootTypes['FileNode'] | NexusGenRootTypes['FolderNode'];
  System: NexusGenRootTypes['SwitchboardHost'];
}

export interface NexusGenUnions {
  TriggerData: NexusGenRootTypes['PullResponderTriggerData'];
}

export type NexusGenRootTypes = NexusGenInterfaces & NexusGenObjects & NexusGenUnions

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars & NexusGenEnums

export interface NexusGenFieldTypes {
  AddDriveResponse: { // field return type
    global: NexusGenRootTypes['DocumentDriveState']; // DocumentDriveState!
    local: NexusGenRootTypes['DocumentDriveLocalState']; // DocumentDriveLocalState!
  }
  Auth: { // field return type
    me: NexusGenRootTypes['User'] | null; // User
    sessions: Array<NexusGenRootTypes['Session'] | null> | null; // [Session]
  }
  Challenge: { // field return type
    hex: string; // String!
    message: string; // String!
    nonce: string; // String!
  }
  CoreUnit: { // field return type
    code: string | null; // String
    descriptionParagraph: string | null; // String
    descriptionParagraphImageSource: string | null; // String
    descriptionSentence: string | null; // String
    id: string | null; // String
    imageSource: string | null; // String
    name: string | null; // String
    shortCode: string | null; // String
  }
  DefaultOperation: { // field return type
    error: string | null; // String
    hash: string; // String!
    id: string | null; // String
    index: number; // Int!
    inputText: string; // String!
    skip: number; // Int!
    timestamp: NexusGenScalars['Date']; // Date!
    type: string; // String!
  }
  DocumentDrive: { // field return type
    created: NexusGenScalars['Date']; // Date!
    documentType: string; // String!
    id: string; // String!
    initialState: NexusGenRootTypes['DocumentDriveState']; // DocumentDriveState!
    lastModified: NexusGenScalars['Date']; // Date!
    name: string; // String!
    operations: NexusGenRootTypes['DefaultOperation'][]; // [DefaultOperation!]!
    revision: number; // Int!
    state: NexusGenRootTypes['DocumentDriveState']; // DocumentDriveState!
  }
  DocumentDriveLocalState: { // field return type
    availableOffline: boolean; // Boolean!
    listeners: NexusGenRootTypes['Listener'][]; // [Listener!]!
    sharingType: string | null; // String
    triggers: NexusGenRootTypes['Trigger'][]; // [Trigger!]!
  }
  DocumentDriveState: { // field return type
    icon: string | null; // String
    id: string; // ID!
    name: string; // String!
    nodes: NexusGenRootTypes['Node'][]; // [Node!]!
    slug: string | null; // String
  }
  FileNode: { // field return type
    documentType: string; // String!
    id: string; // String!
    kind: string; // String!
    name: string; // String!
    parentFolder: string | null; // String
    synchronizationUnits: NexusGenRootTypes['SynchronizationUnit'][]; // [SynchronizationUnit!]!
  }
  FolderNode: { // field return type
    id: string; // String!
    kind: string; // String!
    name: string; // String!
    parentFolder: string | null; // String
  }
  Listener: { // field return type
    block: boolean; // Boolean!
    callInfo: NexusGenRootTypes['ListenerCallInfo'] | null; // ListenerCallInfo
    filter: NexusGenRootTypes['ListenerFilter']; // ListenerFilter!
    label: string | null; // String
    listenerId: string; // ID!
    system: boolean; // Boolean!
  }
  ListenerCallInfo: { // field return type
    data: string | null; // String
    name: string | null; // String
    transmitterType: NexusGenEnums['TransmitterType'] | null; // TransmitterType
  }
  ListenerFilter: { // field return type
    branch: string[] | null; // [String!]
    documentId: string[] | null; // [ID!]
    documentType: string[]; // [String!]!
    scope: string[] | null; // [String!]
  }
  Mutation: { // field return type
    addDrive: NexusGenRootTypes['AddDriveResponse'] | null; // AddDriveResponse
    createChallenge: NexusGenRootTypes['Challenge'] | null; // Challenge
    createSession: NexusGenRootTypes['SessionOutput'] | null; // SessionOutput
    deleteDrive: boolean | null; // Boolean
    revokeSession: NexusGenRootTypes['Session'] | null; // Session
    setDriveIcon: boolean | null; // Boolean
    setDriveName: boolean | null; // Boolean
    solveChallenge: NexusGenRootTypes['SessionOutput'] | null; // SessionOutput
  }
  PullResponderTriggerData: { // field return type
    interval: string; // String!
    listenerId: string; // ID!
    url: string; // String!
  }
  Query: { // field return type
    coreUnit: NexusGenRootTypes['CoreUnit'] | null; // CoreUnit
    coreUnits: Array<NexusGenRootTypes['CoreUnit'] | null> | null; // [CoreUnit]
    driveIdBySlug: string | null; // String
    drives: Array<string | null> | null; // [String]
    system: NexusGenRootTypes['SwitchboardHost'] | null; // SwitchboardHost
  }
  Session: { // field return type
    allowedOrigins: string | null; // String
    createdAt: NexusGenScalars['Date']; // Date!
    createdBy: string; // String!
    id: string; // String!
    isUserCreated: boolean; // Boolean!
    name: string | null; // String
    referenceExpiryDate: NexusGenScalars['Date'] | null; // Date
    referenceTokenId: string; // String!
    revokedAt: NexusGenScalars['Date'] | null; // Date
  }
  SessionOutput: { // field return type
    session: NexusGenRootTypes['Session']; // Session!
    token: string; // String!
  }
  SwitchboardHost: { // field return type
    auth: NexusGenRootTypes['Auth'] | null; // Auth
  }
  SynchronizationUnit: { // field return type
    branch: string; // String!
    scope: string; // String!
    syncId: string; // ID!
  }
  Trigger: { // field return type
    data: NexusGenRootTypes['TriggerData'] | null; // TriggerData
    id: string; // ID!
    type: NexusGenEnums['TriggerType']; // TriggerType!
  }
  User: { // field return type
    address: string; // String!
    createdAt: NexusGenScalars['Date']; // Date!
  }
  IDocument: { // field return type
    created: NexusGenScalars['Date']; // Date!
    documentType: string; // String!
    id: string; // String!
    lastModified: NexusGenScalars['Date']; // Date!
    name: string; // String!
    operations: NexusGenRootTypes['DefaultOperation'][]; // [DefaultOperation!]!
    revision: number; // Int!
  }
  IOperation: { // field return type
    error: string | null; // String
    hash: string; // String!
    id: string | null; // String
    index: number; // Int!
    inputText: string; // String!
    skip: number; // Int!
    timestamp: NexusGenScalars['Date']; // Date!
    type: string; // String!
  }
  Node: { // field return type
    id: string; // String!
    kind: string; // String!
    name: string; // String!
    parentFolder: string | null; // String
  }
  System: { // field return type
    auth: NexusGenRootTypes['Auth'] | null; // Auth
  }
}

export interface NexusGenFieldTypeNames {
  AddDriveResponse: { // field return type name
    global: 'DocumentDriveState'
    local: 'DocumentDriveLocalState'
  }
  Auth: { // field return type name
    me: 'User'
    sessions: 'Session'
  }
  Challenge: { // field return type name
    hex: 'String'
    message: 'String'
    nonce: 'String'
  }
  CoreUnit: { // field return type name
    code: 'String'
    descriptionParagraph: 'String'
    descriptionParagraphImageSource: 'String'
    descriptionSentence: 'String'
    id: 'String'
    imageSource: 'String'
    name: 'String'
    shortCode: 'String'
  }
  DefaultOperation: { // field return type name
    error: 'String'
    hash: 'String'
    id: 'String'
    index: 'Int'
    inputText: 'String'
    skip: 'Int'
    timestamp: 'Date'
    type: 'String'
  }
  DocumentDrive: { // field return type name
    created: 'Date'
    documentType: 'String'
    id: 'String'
    initialState: 'DocumentDriveState'
    lastModified: 'Date'
    name: 'String'
    operations: 'DefaultOperation'
    revision: 'Int'
    state: 'DocumentDriveState'
  }
  DocumentDriveLocalState: { // field return type name
    availableOffline: 'Boolean'
    listeners: 'Listener'
    sharingType: 'String'
    triggers: 'Trigger'
  }
  DocumentDriveState: { // field return type name
    icon: 'String'
    id: 'ID'
    name: 'String'
    nodes: 'Node'
    slug: 'String'
  }
  FileNode: { // field return type name
    documentType: 'String'
    id: 'String'
    kind: 'String'
    name: 'String'
    parentFolder: 'String'
    synchronizationUnits: 'SynchronizationUnit'
  }
  FolderNode: { // field return type name
    id: 'String'
    kind: 'String'
    name: 'String'
    parentFolder: 'String'
  }
  Listener: { // field return type name
    block: 'Boolean'
    callInfo: 'ListenerCallInfo'
    filter: 'ListenerFilter'
    label: 'String'
    listenerId: 'ID'
    system: 'Boolean'
  }
  ListenerCallInfo: { // field return type name
    data: 'String'
    name: 'String'
    transmitterType: 'TransmitterType'
  }
  ListenerFilter: { // field return type name
    branch: 'String'
    documentId: 'ID'
    documentType: 'String'
    scope: 'String'
  }
  Mutation: { // field return type name
    addDrive: 'AddDriveResponse'
    createChallenge: 'Challenge'
    createSession: 'SessionOutput'
    deleteDrive: 'Boolean'
    revokeSession: 'Session'
    setDriveIcon: 'Boolean'
    setDriveName: 'Boolean'
    solveChallenge: 'SessionOutput'
  }
  PullResponderTriggerData: { // field return type name
    interval: 'String'
    listenerId: 'ID'
    url: 'String'
  }
  Query: { // field return type name
    coreUnit: 'CoreUnit'
    coreUnits: 'CoreUnit'
    driveIdBySlug: 'String'
    drives: 'String'
    system: 'SwitchboardHost'
  }
  Session: { // field return type name
    allowedOrigins: 'String'
    createdAt: 'Date'
    createdBy: 'String'
    id: 'String'
    isUserCreated: 'Boolean'
    name: 'String'
    referenceExpiryDate: 'Date'
    referenceTokenId: 'String'
    revokedAt: 'Date'
  }
  SessionOutput: { // field return type name
    session: 'Session'
    token: 'String'
  }
  SwitchboardHost: { // field return type name
    auth: 'Auth'
  }
  SynchronizationUnit: { // field return type name
    branch: 'String'
    scope: 'String'
    syncId: 'ID'
  }
  Trigger: { // field return type name
    data: 'TriggerData'
    id: 'ID'
    type: 'TriggerType'
  }
  User: { // field return type name
    address: 'String'
    createdAt: 'Date'
  }
  IDocument: { // field return type name
    created: 'Date'
    documentType: 'String'
    id: 'String'
    lastModified: 'Date'
    name: 'String'
    operations: 'DefaultOperation'
    revision: 'Int'
  }
  IOperation: { // field return type name
    error: 'String'
    hash: 'String'
    id: 'String'
    index: 'Int'
    inputText: 'String'
    skip: 'Int'
    timestamp: 'Date'
    type: 'String'
  }
  Node: { // field return type name
    id: 'String'
    kind: 'String'
    name: 'String'
    parentFolder: 'String'
  }
  System: { // field return type name
    auth: 'Auth'
  }
}

export interface NexusGenArgTypes {
  DocumentDrive: {
    operations: { // args
      first?: number | null; // Int
      skip?: number | null; // Int
    }
  }
  Mutation: {
    addDrive: { // args
      global: NexusGenInputs['DocumentDriveStateInput']; // DocumentDriveStateInput!
      local: NexusGenInputs['DocumentDriveLocalStateInput']; // DocumentDriveLocalStateInput!
    }
    createChallenge: { // args
      address: string; // String!
    }
    createSession: { // args
      session: NexusGenInputs['SessionInput']; // SessionInput!
    }
    deleteDrive: { // args
      id: string; // String!
    }
    revokeSession: { // args
      sessionId: string; // String!
    }
    setDriveIcon: { // args
      icon: string; // String!
      id: string; // String!
    }
    setDriveName: { // args
      id: string; // String!
      name: string; // String!
    }
    solveChallenge: { // args
      nonce: string; // String!
      signature: string; // String!
    }
  }
  Query: {
    coreUnit: { // args
      id?: string | null; // String
    }
    driveIdBySlug: { // args
      slug?: string | null; // String
    }
  }
  IDocument: {
    operations: { // args
      first?: number | null; // Int
      skip?: number | null; // Int
    }
  }
}

export interface NexusGenAbstractTypeMembers {
  TriggerData: "PullResponderTriggerData"
  IDocument: "DocumentDrive"
  IOperation: "DefaultOperation"
  Node: "FileNode" | "FolderNode"
  System: "SwitchboardHost"
}

export interface NexusGenTypeInterfaces {
  DefaultOperation: "IOperation"
  DocumentDrive: "IDocument"
  FileNode: "Node"
  FolderNode: "Node"
  SwitchboardHost: "System"
}

export type NexusGenObjectNames = keyof NexusGenObjects;

export type NexusGenInputNames = keyof NexusGenInputs;

export type NexusGenEnumNames = keyof NexusGenEnums;

export type NexusGenInterfaceNames = keyof NexusGenInterfaces;

export type NexusGenScalarNames = keyof NexusGenScalars;

export type NexusGenUnionNames = keyof NexusGenUnions;

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = never;

export type NexusGenAbstractsUsingStrategyResolveType = "IDocument" | "IOperation" | "Node" | "System" | "TriggerData";

export type NexusGenFeaturesConfig = {
  abstractTypeStrategies: {
    isTypeOf: false
    resolveType: true
    __typename: false
  }
}

export interface NexusGenTypes {
  context: Context;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  inputTypeShapes: NexusGenInputs & NexusGenEnums & NexusGenScalars;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  fieldTypeNames: NexusGenFieldTypeNames;
  allTypes: NexusGenAllTypes;
  typeInterfaces: NexusGenTypeInterfaces;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractTypeMembers: NexusGenAbstractTypeMembers;
  objectsUsingAbstractStrategyIsTypeOf: NexusGenObjectsUsingAbstractStrategyIsTypeOf;
  abstractsUsingStrategyResolveType: NexusGenAbstractsUsingStrategyResolveType;
  features: NexusGenFeaturesConfig;
}


declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginInputTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {
    /**
     * Authorization for an individual field. Returning "true"
     * or "Promise<true>" means the field can be accessed.
     * Returning "false" or "Promise<false>" will respond
     * with a "Not Authorized" error for the field.
     * Returning or throwing an error will also prevent the
     * resolver from executing.
     */
    authorize?: FieldAuthorizeResolver<TypeName, FieldName>
    
    /**
     * Async validation function. Reject when validation fails. Resolve otherwise.
     */
    validate?: 
        NexusGenArgTypes extends HasTypeField<TypeName, FieldName>
        ? ArgsValidationConfig<NexusGenArgTypes[TypeName][FieldName]>
        : never
        
  }
  interface NexusGenPluginInputFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginSchemaConfig {
  }
  interface NexusGenPluginArgConfig {
  }
}