import { RuntimeCompositeDefinition } from "@composedb/types";
import { ComposeClient } from "@composedb/client";
import { EventSource } from "cross-eventsource";
import { JsonAsString, AggregationDocument } from '@ceramicnetwork/codecs';
import { Codec, decode } from "codeco";
import { Logger } from "pino";
import { fetchEntries, fetchEntry } from "./queries";
import logger from "../../logger";
import { CeramicPowerhouseVerifiableCredential } from "./types";

export interface KYCServiceOptions {
  ceramicUrl?: string;
  logger?: Logger;
  definition: RuntimeCompositeDefinition
}

export class KYCService {

  protected client: ComposeClient;

  protected eventSource: EventSource | null = null;

  protected credentials: CeramicPowerhouseVerifiableCredential[] = [];

  protected codec: Codec<any, any, any>;

  protected logger: Logger;

  constructor(options: KYCServiceOptions) {
    const ceramic = options.ceramicUrl || "http://localhost:7007";
    this.client = new ComposeClient({
      ceramic,
      definition: options.definition as RuntimeCompositeDefinition,
    });
    this.eventSource = new EventSource(`${ceramic}/api/v0/feed/aggregation/documents`)
    this.codec = JsonAsString.pipe(AggregationDocument)
    this.logger = options.logger || logger;
  }

  #fetchCredentials = async (first: number) => {
    const date = new Date().toISOString()
    const data = await this.client.executeQuery<{
      verifiableCredentialEIP712Index: {
        edges: { node: CeramicPowerhouseVerifiableCredential }[];
      };
    }>(fetchEntries, {
      first,
      input: {
        and: [
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

    if (data.errors) {
      throw new Error('Error fetching entries from Ceramic')
    }

    return data.data?.verifiableCredentialEIP712Index.edges.map((e) => e.node) || [];
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

  #updateCredentials = async () => {
    const first = 100;
    let skip = 0;
    let entries: any[] = [];
    let foundEntries = 0;
    const fetchEntriesLoop = async () => {
      const newEntries = await this.#fetchCredentials(first, skip);
      foundEntries = newEntries.length;
      if (foundEntries === first) {
        skip += first;
        entries = entries.concat(newEntries);
        await fetchEntriesLoop();
      } else {
        entries = entries.concat(newEntries);
      }
    };

    await fetchEntriesLoop();
    this.credentials = entries;
  }

  #updateCredential = async (issuerId: string, subjectId: string) => {
    const entry = await this.#fetchCredential(issuerId, subjectId);
    const index = this.credentials.findIndex((e) => e.issuer.id === issuerId && e.credentialSubject.id === subjectId);
    if (!entry) {
      delete this.credentials[index];
      return null;
    }

    if (index !== -1) {
      this.credentials[index] = entry;
    } else {
      this.credentials.push(entry);
    }

    return entry;
  }

  #subscribeToEvents = () => {
    if (!this.eventSource) {
      throw new Error('EventSource not initialized')
    }

    this.eventSource.addEventListener('message', (event) => {
      this.logger.info('event', event);
      const parsedData = decode(this.codec, event.data);
      this.logger.info('parsed', parsedData)
    })

    this.eventSource.addEventListener('error', error => {
      this.logger.error('error', error)
    })
  }


  async init() {
    // await this.#updateCredentials();
    this.#subscribeToEvents();
    return Promise.resolve();
  }

  async getCredential(issuerId: string, subjectId: string) {
    const entry = this.credentials.find((e) => e.issuer.id === issuerId && e.credentialSubject.id === subjectId);
    if (entry) {
      return entry
    }

    const ceramicEntry = await this.#updateCredential(issuerId, subjectId);
    if (ceramicEntry) {
      this.logger.info(`Found entry for issuer ${issuerId} and subject ${subjectId} on ceramic but not in cache`);
      return ceramicEntry;
    }

    return null;
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

    // TODO: check issuer and signature


    return true;
  }
}
