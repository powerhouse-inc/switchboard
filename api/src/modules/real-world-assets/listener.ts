import { Document, OperationScope } from "document-model/document"
import { InternalTransmitterUpdate, Listener } from "document-drive"
import { Prisma } from "@prisma/client"

export const transmitFn = (strands: InternalTransmitterUpdate<Document, OperationScope>[], prisma: Prisma.TransactionClient) => {
  console.log(strands);
  console.log(prisma)
  for (const strand of strands) {

  }
}


export const listener: Listener = {
  driveId: "drive",
  block: true,
  system: true,
  callInfo: {
    name: "RWA Portfolio Operational Data",
    transmitterType: "Internal",
    data: ""
  },
  label: "RWA Listener",
  filter: {
    branch: ["main"],
    documentId: ["*"],
    documentType: ["makerdao/rwa-portfolio"],
    scope: ["global"]
  },
  listenerId: "rwa",
}
