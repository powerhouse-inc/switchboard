import { Listener } from "document-drive"

export const transmitFn = () => {

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
