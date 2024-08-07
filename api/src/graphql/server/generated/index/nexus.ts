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
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
  Attachment: any
  Date: any
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
  DocumentDriveLocalState: { // root type
    availableOffline: boolean; // Boolean!
    sharingType?: string | null; // String
  }
  DocumentDriveState: { // root type
    availableOffline: boolean; // Boolean!
    icon?: string | null; // String
    id: string; // ID!
    name: string; // String!
    nodes: Array<NexusGenRootTypes['Node'] | null>; // [Node]!
    sharingType?: string | null; // String
    slug?: string | null; // String
  }
  Mutation: {};
  Node: { // root type
    documentType?: string | null; // String
    id: string; // String!
    kind: string; // String!
    name: string; // String!
    parentFolder?: string | null; // String
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
  User: { // root type
    address: string; // String!
    createdAt: NexusGenScalars['Date']; // Date!
  }
}

export interface NexusGenInterfaces {
  System: NexusGenRootTypes['SwitchboardHost'];
}

export interface NexusGenUnions {
}

export type NexusGenRootTypes = NexusGenInterfaces & NexusGenObjects

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars

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
  DocumentDriveLocalState: { // field return type
    availableOffline: boolean; // Boolean!
    sharingType: string | null; // String
  }
  DocumentDriveState: { // field return type
    availableOffline: boolean; // Boolean!
    icon: string | null; // String
    id: string; // ID!
    name: string; // String!
    nodes: Array<NexusGenRootTypes['Node'] | null>; // [Node]!
    sharingType: string | null; // String
    slug: string | null; // String
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
  Node: { // field return type
    documentType: string | null; // String
    id: string; // String!
    kind: string; // String!
    name: string; // String!
    parentFolder: string | null; // String
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
  User: { // field return type
    address: string; // String!
    createdAt: NexusGenScalars['Date']; // Date!
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
  DocumentDriveLocalState: { // field return type name
    availableOffline: 'Boolean'
    sharingType: 'String'
  }
  DocumentDriveState: { // field return type name
    availableOffline: 'Boolean'
    icon: 'String'
    id: 'ID'
    name: 'String'
    nodes: 'Node'
    sharingType: 'String'
    slug: 'String'
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
  Node: { // field return type name
    documentType: 'String'
    id: 'String'
    kind: 'String'
    name: 'String'
    parentFolder: 'String'
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
  User: { // field return type name
    address: 'String'
    createdAt: 'Date'
  }
  System: { // field return type name
    auth: 'Auth'
  }
}

export interface NexusGenArgTypes {
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
}

export interface NexusGenAbstractTypeMembers {
  System: "SwitchboardHost"
}

export interface NexusGenTypeInterfaces {
  SwitchboardHost: "System"
}

export type NexusGenObjectNames = keyof NexusGenObjects;

export type NexusGenInputNames = keyof NexusGenInputs;

export type NexusGenEnumNames = never;

export type NexusGenInterfaceNames = keyof NexusGenInterfaces;

export type NexusGenScalarNames = keyof NexusGenScalars;

export type NexusGenUnionNames = never;

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = never;

export type NexusGenAbstractsUsingStrategyResolveType = "System";

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