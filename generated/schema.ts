export type Scalars = {
    String: string,
    Boolean: boolean,
}

export interface AuthPayload {
    token?: Scalars['String']
    user?: User
    __typename: 'AuthPayload'
}

export interface CoreUnit {
    code?: Scalars['String']
    descriptionParagraph?: Scalars['String']
    descriptionParagraphImageSource?: Scalars['String']
    descriptionSentence?: Scalars['String']
    id?: Scalars['String']
    imageSource?: Scalars['String']
    name?: Scalars['String']
    shortCode?: Scalars['String']
    __typename: 'CoreUnit'
}

export interface Mutation {
    signIn?: AuthPayload
    signUp?: AuthPayload
    __typename: 'Mutation'
}

export interface Query {
    coreUnit?: CoreUnit
    coreUnits?: (CoreUnit | undefined)[]
    me?: User
    __typename: 'Query'
}

export interface User {
    id?: Scalars['String']
    password?: Scalars['String']
    username?: Scalars['String']
    __typename: 'User'
}

export interface AuthPayloadGenqlSelection{
    token?: boolean | number
    user?: UserGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface CoreUnitGenqlSelection{
    code?: boolean | number
    descriptionParagraph?: boolean | number
    descriptionParagraphImageSource?: boolean | number
    descriptionSentence?: boolean | number
    id?: boolean | number
    imageSource?: boolean | number
    name?: boolean | number
    shortCode?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MutationGenqlSelection{
    signIn?: (AuthPayloadGenqlSelection & { __args: {user: UserNamePass} })
    signUp?: (AuthPayloadGenqlSelection & { __args: {user: UserNamePass} })
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueryGenqlSelection{
    coreUnit?: (CoreUnitGenqlSelection & { __args?: {id?: (Scalars['String'] | null)} })
    coreUnits?: CoreUnitGenqlSelection
    me?: UserGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UserGenqlSelection{
    id?: boolean | number
    password?: boolean | number
    username?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UserNamePass {password: Scalars['String'],username: Scalars['String']}


    const AuthPayload_possibleTypes: string[] = ['AuthPayload']
    export const isAuthPayload = (obj?: { __typename?: any } | null): obj is AuthPayload => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAuthPayload"')
      return AuthPayload_possibleTypes.includes(obj.__typename)
    }
    


    const CoreUnit_possibleTypes: string[] = ['CoreUnit']
    export const isCoreUnit = (obj?: { __typename?: any } | null): obj is CoreUnit => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCoreUnit"')
      return CoreUnit_possibleTypes.includes(obj.__typename)
    }
    


    const Mutation_possibleTypes: string[] = ['Mutation']
    export const isMutation = (obj?: { __typename?: any } | null): obj is Mutation => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMutation"')
      return Mutation_possibleTypes.includes(obj.__typename)
    }
    


    const Query_possibleTypes: string[] = ['Query']
    export const isQuery = (obj?: { __typename?: any } | null): obj is Query => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQuery"')
      return Query_possibleTypes.includes(obj.__typename)
    }
    


    const User_possibleTypes: string[] = ['User']
    export const isUser = (obj?: { __typename?: any } | null): obj is User => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUser"')
      return User_possibleTypes.includes(obj.__typename)
    }
    