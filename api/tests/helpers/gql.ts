import builder from "gql-query-builder";
import { fetchOrThrow } from "./server";
import {
  DocumentDriveLocalState,
  DocumentDriveState,
} from "document-model-libs/dist/document-models/document-drive";
import { Listener, ListenerRevision, StrandUpdate } from "document-drive";

interface Session {
  id: string;
  name: string;
  referenceExpiryDate: string;
  referenceTokenId: string;
  isUserCreated: boolean;
  allowedOrigins: string;
  revokedAt: string;
  createdAt: string;
}

const sessionFields = [
  "id",
  "name",
  "referenceExpiryDate",
  "referenceTokenId",
  "isUserCreated",
  "allowedOrigins",
  "revokedAt",
  "createdAt",
];

export const createChallenge = (address: string) =>
  fetchOrThrow<{ nonce: string; message: string }>(
    builder.mutation({
      operation: "createChallenge",
      variables: {
        address: {
          value: address,
          type: "String",
          required: true,
        },
      },
      fields: ["nonce", "message"],
    })
  );

export const solveChallenge = (nonce: string, signature: string) =>
  fetchOrThrow<{ token: string; session: Session }>(
    builder.mutation({
      operation: "solveChallenge",
      variables: {
        nonce: {
          value: nonce,
          type: "String",
          required: true,
        },
        signature: {
          value: signature,
          type: "String",
          required: true,
        },
      },
      fields: ["token", { session: sessionFields }],
    })
  );

export const system = () =>
  fetchOrThrow<{ auth: { me: { address: string }, sessions: Session[] } }>(
    builder.query({
      operation: "system",
      fields: [{ auth: [{ me: ["address"] }, { sessions: sessionFields }] }],
    })
  );

export const createSession = (
  name: string,
  allowedOrigins: string,
  expiryDurationSeconds?: number | null
) =>
  fetchOrThrow<{ token: string; session: Session }>(
    builder.mutation({
      operation: "createSession",
      variables: {
        session: {
          value: {
            name,
            expiryDurationSeconds,
            allowedOrigins,
          },
          type: "SessionInput",
          required: true,
        },
      },
      fields: ["token", { session: sessionFields }],
    })
  );

export const revokeSession = (sessionId: string) =>
  fetchOrThrow<Session>(
    builder.mutation({
      operation: "revokeSession",
      variables: {
        sessionId: {
          value: sessionId,
          type: "String!",
        },
      },
      fields: sessionFields,
    })
  );

export const addDrive = () => {
  return fetchOrThrow<{
    global: DocumentDriveState;
    local: DocumentDriveLocalState;
  }>(
    builder.mutation({
      operation: "addDrive",
      variables: {
        global: {
          type: "DocumentDriveStateInput!",
          value: {
            id: "1",
            name: "Monetalis",
            icon: "arranger.png",
          },
        },
        local: {
          type: "DocumentDriveLocalStateInput!",
          value: { sharingType: "private", availableOffline: false },
        },
      },
      fields: [
        {
          global: ["id", "name"],
          local: ["sharingType", "availableOffline"],
        },
      ],
    })
  );
};

export const addBudgetStatement = () => {
  return fetchOrThrow<ListenerRevision[]>(
    builder.mutation({
      operation: "pushUpdates",
      variables: {
        strands: {
          type: "[InputStrandUpdate!]",
          value: [
            {
              driveId: "1",
              scope: "global",
              branch: "main",
              operations: [
                {
                  type: "ADD_FILE",
                  input:
                    '{"id":"1","name":"new file", "documentType": "powerhouse/budget-statement", "scopes": ["global", "local"]}',
                  index: 1,
                  timestamp: "2024-01-15T18:13:54.823Z",
                  hash: "0eho6S5/g2eQnswPvq8R7p/6jpA=",
                },
              ],
            },
          ],
        },
      },
      fields: [
        "driveId",
        "documentId",
        "scope",
        "branch",
        "status",
        "revision",
      ],
    })
  );
};

export const addPullResponderListener = () => {
  return fetchOrThrow<Listener>(
    builder.mutation({
      operation: "registerPullResponderListener",
      variables: {
        filter: {
          type: "InputListenerFilter!",
          value: {
            documentType: ["powerhouse/budget-statement"],
            documentId: ["1"],
            scope: ["global"],
            branch: ["main"],
          },
        },
      },
      fields: ["listenerId", "label", "block", "system"],
    })
  );
};

export const pullStrands = (listenerId: string) => {
  return fetchOrThrow<StrandUpdate[]>(
    builder.query({
      operation: "strands",
      variables: {
        listenerId: {
          type: "ID!",
          value: listenerId,
        },
      },
      fields: [
        "driveId",
        "documentId",
        "scope",
        "branch",
        { operations: ["index", "skip", "operation", "input", "hash"] },
      ],
    })
  );
};

export const acknowledge = (
  listenerId: string,
  revisions: ListenerRevision[]
) => {
  return fetchOrThrow<boolean>(
    builder.mutation({
      operation: "acknowledge",
      variables: {
        listenerId: {
          type: "String!",
          value: listenerId,
        },
        revisions: {
          type: "[ListenerRevisionInput!]!",
          value: revisions,
        },
      },
    })
  );
};

export const addLineItem = (address: string) => {
  return fetchOrThrow<ListenerRevision[]>(
    builder.mutation({
      operation: "pushUpdates",
      variables: {
        strands: {
          type: "[InputStrandUpdate!]",
          value: [
            {
              driveId: "1",
              documentId: "1",
              scope: "global",
              branch: "main",
              operations: [
                {
                  type: "AddAccountInput",
                  input: `{"address": "${address}"}`,
                  index: 1,
                  timestamp: "2024-01-16T18:13:54.823Z",
                  hash: "0eho6S5/g2eQnswPvq8R7p/6jpA=",
                },
              ],
            },
          ],
        },
      },
      fields: [
        "driveId",
        "documentId",
        "scope",
        "branch",
        "status",
        "revision",
      ],
    })
  );
};
