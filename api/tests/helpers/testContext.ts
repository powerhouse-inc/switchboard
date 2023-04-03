import {Client, createClient} from '../../generated'

export interface TestContext {
  client: Client;
  baseUrl: string;
}

export const context = {} as TestContext;

export function setHeader (headers: Record<string,string>) {
  context.client = createClient({
    url: context.baseUrl,
    headers: headers,
  })
}

export function setClient (baseUrl: string, headers: Record<string,string>) {
  context.baseUrl = baseUrl;
  context.client = createClient({
    url: baseUrl,
    headers: headers,
  })
}
