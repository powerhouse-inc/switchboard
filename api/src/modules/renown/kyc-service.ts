import { RuntimeCompositeDefinition } from "@composedb/types";
import { compose } from "./ceramic/compose";
import { User } from "./types";
import { ComposeClient } from "@composedb/client";
import logger from "../../logger";



const users: User[] = [];

export interface KYCServiceOptions {
  // The URL of the Ceramic node
  ceramicUrl?: string;
  definition: RuntimeCompositeDefinition
}

export class KYCService {

  protected client: ComposeClient;

  protected eventSource: EventSource | null = null;

  protected entries: any[] = [];

  constructor(options: KYCServiceOptions) {
    this.options = options;
    this.client = new ComposeClient({
      ceramic: options.ceramicUrl || "http://localhost:7007",
      definition: options.definition as RuntimeCompositeDefinition,
    });
  }

  #fetchEntriesFromCeramic = async (first: number, skip: number) => {

    const entries = await this.client.executeQuery({
      query: `
        query {
          entries {
            id
            content
          }
        }
      `,
    });

    return entries as any[];
  }

  #fetchEntryFromCeramic = async (id: string) => {
    const entry = await this.client.executeQuery({
      query: `
        query {
          entry(id: "${id}") {
            id
            content
          }
        }
      `,
    });

    return entry as any;
  }

  #updateEntries = async () => {
    const first = 100;
    let skip = 0;
    let entries: any[] = [];
    let foundEntries = 0;
    const fetchEntries = async () => {
      const newEntries = await this.#fetchEntriesFromCeramic(first, skip);
      foundEntries = newEntries.length;
      if (foundEntries === first) {
        skip += first;
        entries = entries.concat(newEntries);
        await fetchEntries();
      } else {
        entries = entries.concat(newEntries);
      }
    };

    await fetchEntries();
    this.entries = entries;
  }

  #updateEntry = async (signer: any) => {
    const entry = await this.#fetchEntryFromCeramic(signer.id);
    if (!entry) {
      return null;
    }

    const index = this.entries.findIndex((e) => e.id === signer.id);
    if (index !== -1) {
      this.entries[index] = entry;
    } else {
      this.entries.push(entry);
    }

    return entry;
  }

  #subscribeToEvents = () => {
    this.eventSource = this.client.subscribeToUpdates(async () => {
      await this.#updateEntries();
    });
  }


  async init() {
    this.#subscribeToEvents();
    await this.#updateEntries();
    return Promise.resolve();
  }

  async lookupSigner(signer: any) {
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

