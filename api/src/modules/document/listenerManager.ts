import path from 'path';
import fs from 'fs';
import { DocumentDriveServer, InternalTransmitter } from 'document-drive';
import {
  Listener,
  ListenerFilter,
  actions,
  reducer,
  DocumentDriveDocument
} from 'document-model-libs/document-drive';

const listeners: Promise<any>[] = [];

function loadModules(startPath: string, filter: string) {
  if (!fs.existsSync(startPath)) {
    console.log("no dir ", startPath);
    return;
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
};

function isListenerRegistered(drive: DocumentDriveDocument, listener: Listener) {
  const listeners = drive.state.local.listeners;
  return listeners.filter((l) => l.listenerId === listener.listenerId).length > 0;
}

async function registerListener(driveServer: DocumentDriveServer, driveId: string, listener: Listener) {
  let drive = await driveServer.getDrive(driveId);

  drive = reducer(drive, actions.addListener({ listener }));
  const operation = drive.operations.local.slice().pop();
  if (!operation) {
    throw new Error('Invalid Listener');
  }
  return driveServer.addDriveOperations(driveId, [operation]);
}

export async function init(driveServer: DocumentDriveServer) {
  loadModules('./src/modules', 'listener.ts');
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
        transmit: transmitFn
      })
    }
  }
}


