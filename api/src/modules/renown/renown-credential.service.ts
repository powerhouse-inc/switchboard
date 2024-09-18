import { RuntimeCompositeDefinition } from "@composedb/types";
import { ComposeClient } from "@composedb/client";
import { EventSource } from "cross-eventsource";
import { JsonAsString, AggregationDocument } from '@ceramicnetwork/codecs';
import { decode } from "codeco";
import { Logger } from "pino";
import { fetchEntry } from "./queries";
import logger from "../../logger";
import { CeramicPowerhouseVerifiableCredential } from "./types";
import { definition } from "./ceramic/definition";

export interface RenownCredentialServiceOptions {
  ceramicUrl?: string;
  logger?: Logger;
  definition: RuntimeCompositeDefinition
}

export class RenownCredentialService {

  protected client: ComposeClient;

  protected eventSource: EventSource | null = null;

  protected credentials: CeramicPowerhouseVerifiableCredential[] = [];

  protected Codec = JsonAsString.pipe(AggregationDocument)

  protected logger: Logger;

  constructor(options: RenownCredentialServiceOptions) {
    const ceramic = options.ceramicUrl || "http://localhost:7007";
    this.client = new ComposeClient({
      ceramic,
      definition: options.definition as RuntimeCompositeDefinition,
    });
    this.eventSource = new EventSource(`${ceramic}/api/v0/feed/aggregation/documents`)
    this.logger = options.logger || logger;
  }

  #fetchCredential = async (issuerId: string, subjectId: string) => {
    const date = new Date().toISOString()
    const result = await this.client.executeQuery<{
      verifiableCredentialEIP712Index: {
        edges: { node: CeramicPowerhouseVerifiableCredential }[];
      };
    }>(fetchEntry, {
      input: {
        and: [
          {
            where: {
              issuerId: {
                equalTo: issuerId,
              },
              subjectId: {
                equalTo: subjectId,
              },
            },
          },
          {
            or: [
              {
                where: {
                  revocationDate: {
                    greaterThan: date,
                  },
                },
              },
              {
                where: {
                  revocationDate: {
                    isNull: true,
                  },
                },
              },
            ],
          },
          {
            or: [
              {
                where: {
                  expirationDate: {
                    greaterThan: date,
                  }
                }
              },
              {
                where: {
                  expirationDate: {
                    isNull: true,
                  }
                }
              }
            ]
          }
        ],
      },
    });

    if (result.errors) {
      throw new Error('Error fetching entry from Ceramic')
    }

    const { data } = result;
    if (!data || data.verifiableCredentialEIP712Index.edges.length === 0) {
      return null;
    }

    return data.verifiableCredentialEIP712Index.edges[0]!.node;
  }

  #replaceCredential = (credential: CeramicPowerhouseVerifiableCredential) => {
    const index = this.credentials.findIndex(
      (e) => e.issuer.id === credential.issuer.id && e.credentialSubject.id === credential.credentialSubject.id
    );
    if (index !== -1) {
      if (credential.revocationDate && credential.revocationDate < new Date().toISOString()) {
        delete this.credentials[index];
      } else {
        this.credentials[index] = credential;
      }
    } else {
      this.credentials.push(credential);
    }
  }

  #updateCredential = async (issuerId: string, subjectId: string) => {
    const entry = await this.#fetchCredential(issuerId, subjectId);
    const index = this.credentials.findIndex((e) => e.issuer.id === issuerId && e.credentialSubject.id === subjectId);
    if (!entry) {
      delete this.credentials[index];
      return null;
    }

    this.#replaceCredential(entry);
    return entry;
  }

  #subscribeToEvents = () => {
    if (!this.eventSource) {
      throw new Error('EventSource not initialized')
    }

    this.eventSource.addEventListener('message', (event) => {
      const { content } = JSON.parse(event.data);
      const parsedCredential = JSON.parse(content) as CeramicPowerhouseVerifiableCredential;
      this.#replaceCredential(parsedCredential);
    })

    this.eventSource.addEventListener('error', error => {
      this.logger.error(error)
    })
  }


  async init() {
    this.#subscribeToEvents();
    return Promise.resolve();
  }

  async getCredential(issuerId: string, subjectId: string) {
    const entry = this.credentials.find((e) => e.issuer.id === issuerId && e.credentialSubject.id === subjectId);
    if (entry) {
      return entry
    }

    return this.#updateCredential(issuerId, subjectId);
  }

  async checkCredential(credential: CeramicPowerhouseVerifiableCredential, remote: boolean = true) {
    if (
      credential.revocationDate
      || credential.issuanceDate > new Date().toISOString()
      || (credential.expirationDate && credential.expirationDate < new Date().toISOString())
    ) {
      return false;
    }

    if (remote) {
      const remoteCredential = await this.#updateCredential(credential.issuer.id, credential.credentialSubject.id);

      if (!remoteCredential) {
        return false;
      }

      const remoteValid = await this.checkCredential(remoteCredential, false);
      if (!remoteValid) {
        return false;
      }

      if (remoteCredential.issuanceDate !== credential.issuanceDate) {
        return false;
      }
    }

    return true;
  }
}

export const service: RenownCredentialService = new RenownCredentialService({
  definition: definition as RuntimeCompositeDefinition,
  ceramicUrl: "https://ceramic-ksdc-mainnet.hirenodes.io",
});

export async function initRenownCredentialService() {
  await service.init();
}
