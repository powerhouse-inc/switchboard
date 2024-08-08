import { RuntimeCompositeDefinition } from "@composedb/types";
import { compose } from "./ceramic/compose";
import { User } from "./types";
import { ComposeClient } from "@composedb/client";
import logger from "../../logger";
import { EventSource } from "cross-eventsource";
import { JsonAsString, AggregationDocument } from '@ceramicnetwork/codecs';
import { Codec, decode } from "codeco";
import { fetchEntries } from "./queries";

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
    this.client = new ComposeClient({
      ceramic: options.ceramicUrl || "http://localhost:7007",
      definition: options.definition as RuntimeCompositeDefinition,
    });

    this.eventSource = new EventSource('http://localhost:7007/api/v0/feed/aggregation/documents')
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
    return result;
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

  #updateEntry = async (signer: any) => {
    const entry = await this.#fetchEntryFromCeramic(signer.id);
    const index = this.entries.findIndex((e) => e.id === signer.id);
    if (!entry) {
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
      console.log('message', event)
      const parsedData = decode(KYCService.Codec, event.data);
      console.log('parsed', parsedData)
    })

    this.eventSource.addEventListener('error', error => {
      console.log('error', error)
    })
  }


  async init() {
    this.#subscribeToEvents();
    await this.#updateEntries();
    return Promise.resolve();
  }

  async lookup(signer: any) {
    const entry = this.entries.find((e) => e.id === signer);
    if (entry) {
      return entry
    }

    const ceramicEntry = await this.#updateEntry(signer);
    if (ceramicEntry) {
      logger.info(`Found entry for signer ${signer} on ceramic but not in cache`);
      return ceramicEntry;
    }

    return null;
  }
}
