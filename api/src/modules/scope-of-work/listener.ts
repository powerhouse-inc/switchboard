import { InternalTransmitterUpdate } from "document-drive";
import {ScopeOfWorkDocument, CreateDeliverableInput } from "document-model-libs/scope-of-work";
import { getChildLogger } from "../../logger";
import { Prisma } from "@prisma/client";
import { Octokit } from "@octokit/rest";

const GITHUB_REPO_OWNER = "powerhouse";
const GITHUB_REPO_NAME = "rwa";
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

const logger = getChildLogger({ msgPrefix: 'RWA Internal Listener' }, { moduleName: "RWA Internal Listener" });
export const options: any = {
    listenerId: "scope-of-work-github",
    filter: {
        branch: ["main"],
        documentId: ["*"],
        documentType: ["powerhouse/scope-of-work"],
        scope: ["*"],
    },
    block: false,
    label: "scope-of-work-github",
}


export async function transmit(strands: InternalTransmitterUpdate<ScopeOfWorkDocument, "global">[], prisma: Prisma.TransactionClient) {
    for (const strand of strands) {
        try {
            await handleScopeOfWorkDocument(strand as InternalTransmitterUpdate<ScopeOfWorkDocument, "global">, prisma);
        } catch (e) {
            logger.error({ msg: "Error processing strand", error: e });
            continue;
        }
    }

}


async function handleScopeOfWorkDocument(strand: InternalTransmitterUpdate<ScopeOfWorkDocument, "global">, prisma: Prisma.TransactionClient) {
    for(let op  of strand.operations) {
        if(op.type === "CREATE_DELIVERABLE") {
            const input = op.input as CreateDeliverableInput;
            await updateDeliverableInDb(strand.driveId, strand.documentId, input.id, prisma)
        }
    }
}

async function updateDeliverableInDb(driveId: string, documentId: string, deliverableId: string, prisma: Prisma.TransactionClient) {
    try {
        await prisma.scopeOfWorkDeliverable.findUnique({
            where: {
                id_driveId_documentId: {
                    id: deliverableId,
                    driveId: driveId,
                    documentId: documentId,
                }
            }
        })
        return false;
    } catch (e) {
        console.log("deliverable not found in db")
    }

    try {
        await createGitHubIssue("New Deliverable Created", "A new deliverable has been created in the scope of work document")
        await prisma.scopeOfWorkDeliverable.create({
            data: {
                id: deliverableId,
                driveId: driveId,
                documentId: documentId,
                title: "Deliverable",
                description: "Description",
                status: "NOT_STARTED",
                githubCreated: true
            }
        })
    } catch (e) {
        console.log("   Error creating github issue")
    }
}

async function createGitHubIssue(title: string, body: string) {
    try {
        await octokit.issues.create({
            owner: GITHUB_REPO_OWNER,
            repo: GITHUB_REPO_NAME,
            title: title,
            body: body,
        });
    } catch (error) {
      logger.error("Error creating GitHub issue:", error);
      throw error;
    }
}
