export type Scalars = {
    String: string,
    ID: string,
    DateTime: any,
    Boolean: boolean,
    Int: number,
}

export interface AuthPayload {
    session: Session
    token: Scalars['String']
    __typename: 'AuthPayload'
}


/** CoreUnit */
export interface CoreUnit {
    code: Scalars['String']
    descriptionParagraph: Scalars['String']
    descriptionParagraphImageSource: Scalars['String']
    descriptionSentence: Scalars['String']
    id: Scalars['ID']
    imageSource: Scalars['String']
    name: Scalars['String']
    shortCode: Scalars['String']
    __typename: 'CoreUnit'
}

export interface Mutation {
    createSession: SessionCreateOutput
    revokeSession: Session
    signIn: AuthPayload
    signUp: AuthPayload
    __typename: 'Mutation'
}

export interface Query {
    coreUnit: CoreUnit
    coreUnits: CoreUnit[]
    me: User
    sessions: Session[]
    __typename: 'Query'
}

export interface Session {
    createdAt: Scalars['DateTime']
    createdBy: Scalars['String']
    id: Scalars['ID']
    isUserCreated: Scalars['Boolean']
    name?: Scalars['String']
    referenceExpiryDate?: Scalars['DateTime']
    referenceTokenId: Scalars['String']
    revokedAt?: Scalars['DateTime']
    __typename: 'Session'
}

export interface SessionCreateOutput {
    session: Session
    token: Scalars['String']
    __typename: 'SessionCreateOutput'
}


/** A user */
export interface User {
    id: Scalars['ID']
    password: Scalars['String']
    username: Scalars['String']
    __typename: 'User'
}

export interface AuthPayloadGenqlSelection{
    session?: SessionGenqlSelection
    token?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** CoreUnit */
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
    createSession?: (SessionCreateOutputGenqlSelection & { __args: {session: SessionCreateInput} })
    revokeSession?: (SessionGenqlSelection & { __args: {sessionId: Scalars['String']} })
    signIn?: (AuthPayloadGenqlSelection & { __args: {user: UserNamePassInput} })
    signUp?: (AuthPayloadGenqlSelection & { __args: {user: UserNamePassInput} })
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueryGenqlSelection{
    coreUnit?: (CoreUnitGenqlSelection & { __args: {id: Scalars['String']} })
    coreUnits?: CoreUnitGenqlSelection
    me?: UserGenqlSelection
    sessions?: SessionGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SessionGenqlSelection{
    createdAt?: boolean | number
    createdBy?: boolean | number
    id?: boolean | number
    isUserCreated?: boolean | number
    name?: boolean | number
    referenceExpiryDate?: boolean | number
    referenceTokenId?: boolean | number
    revokedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface SessionCreateInput {expiryDurationSeconds?: (Scalars['Int'] | null),name: Scalars['String']}

export interface SessionCreateOutputGenqlSelection{
    session?: SessionGenqlSelection
    token?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A user */
export interface UserGenqlSelection{
    id?: boolean | number
    password?: boolean | number
    username?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface UserNamePassInput {password: Scalars['String'],username: Scalars['String']}


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
    


    const Session_possibleTypes: string[] = ['Session']
    export const isSession = (obj?: { __typename?: any } | null): obj is Session => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSession"')
      return Session_possibleTypes.includes(obj.__typename)
    }
    


    const SessionCreateOutput_possibleTypes: string[] = ['SessionCreateOutput']
    export const isSessionCreateOutput = (obj?: { __typename?: any } | null): obj is SessionCreateOutput => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSessionCreateOutput"')
      return SessionCreateOutput_possibleTypes.includes(obj.__typename)
    }
    


    const User_possibleTypes: string[] = ['User']
    export const isUser = (obj?: { __typename?: any } | null): obj is User => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUser"')
      return User_possibleTypes.includes(obj.__typename)
    }
    