
import { DocumentDriveServer } from 'document-drive/server';
import { MemoryStorage } from 'document-drive/storage/memory';
import * as DocumentModelsLibs from 'document-model-libs/document-models';
import { actions } from 'document-model-libs/document-drive';
import { randomUUID } from 'crypto';

async function init() {
    const server = new DocumentDriveServer(Object.values(DocumentModelsLibs));
    await server.initialize();
    const drive = await server.addRemoteDrive("http://localhost:3000/d/load", { availableOffline: true, triggers: [], listeners: [], sharingType: "public" });
    let index = 0;
    while (true) {
        const timestamp = (new Date()).toUTCString();
        console.time("test" + index);
        const result = await Promise.all([
            server.addDriveAction("load", actions.addFolder({id: randomUUID(), name: randomUUID()})),
            // server.addDriveAction("load", actions.addFile({
            //     id: randomUUID(), name: randomUUID(),
            //     documentType: 'powerhouse/budget-statement',
            //     synchronizationUnits: [
            //         {
            //             syncId: randomUUID(),
            //             scope: "global",
            //             branch: 'main'
            //         }
            //     ]
            // })),
            // server.addDriveAction("load", actions.addFolder({id: randomUUID(), name: randomUUID()})),
        ]);
        console.timeEnd("test" + index);
        index += 1
        console.log(index, result.map(r => r.status));
        await new Promise(resolve => setTimeout(resolve, 100))
    }
}

init().catch(console.error);