import { Prisma } from '@prisma/client';
import {
  DocumentDriveServer,
  IReceiver,
  InternalTransmitter,
  InternalTransmitterUpdate
} from 'document-drive';
import {
  DocumentDriveDocument,
  Listener
} from 'document-model-libs/document-drive';
import { getChildLogger } from '../../logger';
// eslint-disable-next-line import/no-cycle
import * as modules from '..';
import type { SwitchboardModule, SwitchboardTransmitter } from '../types';

const logger = getChildLogger(
  { msgPrefix: 'Listener Manager' },
  { module: 'Listener Manager' }
);

const transmitters: SwitchboardTransmitter[] = [];
function loadModules(): SwitchboardTransmitter[] {
  // eslint-disable-next-line no-restricted-syntax
  for (const moduleName of Object.keys(modules)) {
    const module = modules[moduleName] as SwitchboardModule;
    if (module.transmitter) {
      logger.info(`Loading listener from ${moduleName}`);
      transmitters.push(module.transmitter);
    }
  }
  return transmitters;
}

function isListenerRegistered(
  drive: DocumentDriveDocument,
  listener: Listener
) {
  const { listeners } = drive.state.local;
  return listeners.filter(l => l.listenerId === listener.listenerId).length > 0;
}

async function registerListener(
  driveServer: DocumentDriveServer,
  driveId: string,
  listener: Listener
) {
  const receiver: IReceiver = {
    transmit: async () => {}
  };
  await driveServer.addInternalListener(driveId, receiver, {
    listenerId: listener.listenerId,
    filter: listener.filter,
    block: false,
    label: listener.label!
  });

  logger.info(
    `Listener ${listener.label}(${listener.listenerId}) registered for drive ${driveId}`
  );
}

export async function init(
  driveServer: DocumentDriveServer,
  prisma: Prisma.TransactionClient
) {
  const listeners = loadModules();
  const drives = await driveServer.getDrives();
  // eslint-disable-next-line no-restricted-syntax
  for (const { options, transmit } of listeners) {
    if (!options || !transmit) {
      continue;
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const driveId of drives) {
      try {
        const drive = await driveServer.getDrive(driveId);
        if (!isListenerRegistered(drive, options)) {
          await registerListener(driveServer, driveId, options);
        }

        const transmitter = await driveServer.getTransmitter(
          driveId,
          options.listenerId
        );
        if (transmitter instanceof InternalTransmitter) {
          logger.info(`Setting receiver for ${options.listenerId}`);
          transmitter.setReceiver({
            transmit: async (strands: InternalTransmitterUpdate[]) => {
              transmit(strands, prisma);
            },
            disconnect: async ()  =>{
              logger.info(`Disconnecting listener ${options.listenerId}`);
            }
          });
        }
      } catch (e) {
        logger.error(
          `Error while initializing listener ${options.listenerId} for drive ${driveId}`,
          e
        );
      }
    }
  }
}
