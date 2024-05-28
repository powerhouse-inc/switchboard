import type { Prisma } from '@prisma/client';
import type { InternalTransmitterUpdate } from 'document-drive';
import type { ListenerFilter } from 'document-model-libs/document-drive';

export interface IReceiverOptions {
  listenerId: string;
  label: string;
  block: boolean;
  filter: ListenerFilter;
}

export type InternalTransmit = (
  strands: InternalTransmitterUpdate[],
  prisma?: Prisma.TransactionClient)
=> Promise<void>;

export type SwitchboardTransmitter = { transmit: InternalTransmit, options: IReceiverOptions };

export type SwitchboardModule = {
  transmitter?: SwitchboardTransmitter
};
