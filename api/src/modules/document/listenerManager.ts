import path from 'path';
import fs from 'fs';
import { DocumentDriveServer, IReceiver, InternalTransmitter, InternalTransmitterUpdate } from 'document-drive';
import { Listener, DocumentDriveDocument } from 'document-model-libs/document-drive';
import { Document, OperationScope } from "document-model/document"
import { Prisma } from '@prisma/client';


function loadModules(startPath: string, filter: string): Promise<any>[] {
    const listeners: Promise<any>[] = [];
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
}

export async function init(driveServer: DocumentDriveServer, prisma: Prisma.TransactionClient) {
    const listeners = loadModules('./src/modules', 'listener.ts');
    const modules = await Promise.all(listeners);
    const drives = await driveServer.getDrives();
    for (const { listener, transmitFn } of modules) {
        if (!listener || !transmitFn) {
            continue;
        }

        for (const driveId of drives) {
            const drive = await driveServer.getDrive(driveId);
            if (!isListenerRegistered(drive, listener)) {
                await registerListener(driveServer, driveId, listener);
            }

            const transmitter = (await driveServer.getTransmitter(driveId, listener.listenerId)) as InternalTransmitter;
            transmitter.setReceiver({
                transmit: async (strands: InternalTransmitterUpdate<Document, OperationScope>[]) => {
                    transmitFn(strands, prisma)
                }
            })
        }
    }
}


