import { RuntimeCompositeDefinition } from "@composedb/types";
import { ComposeClient } from "@composedb/client";
import { EventSource } from "cross-eventsource";
import { JsonAsString, AggregationDocument } from '@ceramicnetwork/codecs';
import { Codec, decode } from "codeco";
import { fetchEntries } from "./queries";
import logger from "../../logger";
import { CeramicPowerhouseVerifiableCredential } from "./types";

export interface KYCServiceOptions {
  // The URL of the Ceramic node
  ceramicUrl?: string;
  definition: RuntimeCompositeDefinition
}

export class KYCService {

  protected client: ComposeClient;

  protected eventSource: EventSource | null = null;

  protected entries: any[] = [];

  protected codec: Codec<any, any, any>;

  constructor(options: KYCServiceOptions) {
    const ceramic = options.ceramicUrl || "http://localhost:7007";
    this.client = new ComposeClient({
      ceramic,
      definition: options.definition as RuntimeCompositeDefinition,
    });

    this.eventSource = new EventSource(`${ceramic}/api/v0/feed/aggregation/documents`)
    this.codec = JsonAsString.pipe(AggregationDocument)
  }

  #fetchEntriesFromCeramic = async (first: number, skip: number) => {
    const date = new Date().toISOString()
    const entries = await this.client.executeQuery<{
      verifiableCredentialEIP712Index: {
        edges: { node: CeramicPowerhouseVerifiableCredential }[];
      };
    }>(fetchEntries, {
      first,
      skip,
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
        ],
      },
    });

    return entries as any[];
  }

  #fetchEntryFromCeramic = async (issuerId: string, subjectId: string) => {
    const date = new Date().toISOString()
    const result = await this.client.executeQuery<{
      verifiableCredentialEIP712Index: {
        edges: { node: CeramicPowerhouseVerifiableCredential }[];
      };
    }>(fetchEntries, {
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
        ],
      },
    });

    if (result.errors) {
      return null;
    }

    const { data } = result;
    if (!data || data.verifiableCredentialEIP712Index.edges.length === 0) {
      return null;
    }

    return data.verifiableCredentialEIP712Index.edges[0]!.node;
  }

  #updateEntries = async () => {
    const first = 100;
    let skip = 0;
    let entries: any[] = [];
    let foundEntries = 0;
    const fetchEntriesLoop = async () => {
      const newEntries = await this.#fetchEntriesFromCeramic(first, skip);
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
    this.entries = entries;
  }

  #updateEntry = async (issuerId: string, subjectId: string) => {
    const entry = await this.#fetchEntryFromCeramic(issuerId, subjectId);
    const index = this.entries.findIndex((e) => e.issuerId === issuerId && e.subjectId === subjectId);
    if (!entry && index !== -1) {
      delete this.entries[index];
      return null;
    }

    if (index !== -1) {
      this.entries[index] = entry;
    } else {
      this.entries.push(entry);
    }

    return entry;
  }

  #subscribeToEvents = () => {
    if (!this.eventSource) {
      throw new Error('EventSource not initialized')
    }

    this.eventSource.addEventListener('message', (event) => {
      logger.info('event', event);
      const parsedData = decode(this.codec, event.data);
      logger.info('parsed', parsedData)
    })

    this.eventSource.addEventListener('error', error => {
      logger.error('error', error)
    })
  }


  async init() {
    this.#subscribeToEvents();
    await this.#updateEntries();
    return Promise.resolve();
  }

  async lookup(issuerId: string, subjectId: string) {
    const entry = this.entries.find((e) => e.issuerId === issuerId && e.subjectId === subjectId);
    if (entry) {
      return entry
    }

    const ceramicEntry = await this.#updateEntry(issuerId, subjectId);
    if (ceramicEntry) {
      logger.info(`Found entry for issuer ${issuerId} and subject ${subjectId} on ceramic but not in cache`);
      return ceramicEntry;
    }

    return null;
  }
}
