import path from 'path';
import fs from 'fs';
import { DocumentDriveServer, IReceiver, InternalTransmitter, InternalTransmitterUpdate } from 'document-drive';
import { Listener, DocumentDriveDocument } from 'document-model-libs/document-drive';
import { Document, OperationScope } from "document-model/document"
import { Prisma } from '@prisma/client';
import { getChildLogger } from '../../logger';

const logger = getChildLogger({ msgPrefix: 'Listener Manager' });

const listeners: Promise<any>[] = [];
function loadModules(startPath: string, filter: string): Promise<any>[] {
    if (!fs.existsSync(startPath)) {
        console.log("no dir ", startPath);
        return [];
    }

    var files = fs.readdirSync(startPath);
    for (var i = 0; i < files.length; i++) {
        var filename = path.join(startPath, files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            loadModules(filename, filter); //recursive
        } else if (filename.endsWith(filter)) {
            logger.info(`Loading listener from ${filename}`);
            listeners.push(import(filename));
        };
    };
    return listeners;
};

function isListenerRegistered(drive: DocumentDriveDocument, listener: Listener) {
    const listeners = drive.state.local.listeners;
    return listeners.filter((l) => l.listenerId === listener.listenerId).length > 0;
}

async function registerListener(driveServer: DocumentDriveServer, driveId: string, listener: Listener) {
    const receiver: IReceiver = {
        transmit: async () => { }
    }
    await driveServer.addInternalListener(driveId, receiver, {
        listenerId: listener.listenerId,
        filter: listener.filter,
        block: false,
        label: listener.label!,
    })

    logger.info(`Listener ${listener.label}(${listener.listenerId}) registered for drive ${driveId}`);
}

export async function init(driveServer: DocumentDriveServer, prisma: Prisma.TransactionClient) {
    loadModules('./src/modules', 'listener.ts');
    const modules = await Promise.all(listeners);
    const drives = await driveServer.getDrives();
    for (const { listener, transmit } of modules) {
        if (!listener || !transmit) {
            continue;
        }

        for (const driveId of drives) {
            const drive = await driveServer.getDrive(driveId);
            if (!isListenerRegistered(drive, listener)) {
                await registerListener(driveServer, driveId, listener);
            }

            const transmitter = (await driveServer.getTransmitter(driveId, listener.listenerId));
            if (transmitter instanceof InternalTransmitter) {
                logger.info(`Setting receiver for ${listener.listenerId}`);
                transmitter.setReceiver({
                    transmit: async (strands: InternalTransmitterUpdate<Document, OperationScope>[]) => {
                        transmit(strands, prisma)
                    }
                })
            }
        }
    }
}
