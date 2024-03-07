import { Prisma, RWAPortfolio } from "@prisma/client";
import { InternalTransmitterUpdate, OperationUpdate } from "document-drive";
import { AddFileInput, DeleteNodeInput, DocumentDriveDocument, DocumentDriveState, ListenerFilter, actions } from "document-model-libs/document-drive";
import { CashGroupTransactionType, CreateFixedIncomeAssetInput, EditFixedIncomeAssetInput, RealWorldAssetsDocument, RealWorldAssetsState, utils } from "document-model-libs/real-world-assets"
import { getChildLogger } from "../../logger";
import { Action } from "document-model/document";

const logger = getChildLogger({ msgPrefix: 'RWA Internal Listener' });
export interface IReceiverOptions {
    listenerId: string;
    label: string;
    block: boolean;
    filter: ListenerFilter;
}

export const listener: IReceiverOptions = {
    listenerId: "real-world-assets",
    filter: {
        branch: ["main"],
        documentId: ["*"],
        documentType: ["makerdao/rwa-portfolio", "powerhouse/document-drive"],
        scope: ["*"],
    },
    block: false,
    label: "real-world-assets",
}


export async function transmit(strands: InternalTransmitterUpdate<RealWorldAssetsDocument | DocumentDriveDocument, "global">[], prisma: Prisma.TransactionClient) {
    // logger.info(strands);
    for (const strand of strands) {

        if (strand.documentId === "") {
            await handleDriveStrand(strand as InternalTransmitterUpdate<DocumentDriveDocument, "global">, prisma);
        } else {
            await handleRwaDocumentStrand(strand as InternalTransmitterUpdate<RealWorldAssetsDocument, "global">, prisma);
        }



    }
}



async function handleDriveStrand(strand: InternalTransmitterUpdate<DocumentDriveDocument, "global">, prisma: Prisma.TransactionClient) {
    logger.info("Received strand for drive");
    if (strandStartsFromOpZero(strand)) {
        await deleteDriveState(strand.state, prisma);
    }

    await doSurgicalDriveUpdate(strand, prisma);
}

function strandStartsFromOpZero(strand: InternalTransmitterUpdate<DocumentDriveDocument | RealWorldAssetsDocument, "global">) {
    const resetNeeded = strand.operations.length > 0 && strand.operations[0].index === 0;
    logger.info(`Reset needed: ${resetNeeded}`);
    return resetNeeded;
}
async function doSurgicalDriveUpdate(strand: InternalTransmitterUpdate<DocumentDriveDocument, "global">, prisma: Prisma.TransactionClient) {
    logger.info("Doing surgical drive update");
    for (const operation of strand.operations) {
        logger.info(`Operation: ${operation.type}`);
        switch (operation.type) {
            case "ADD_FILE":
                const addFileInput = operation.input as AddFileInput;
                if (addFileInput.documentType === "makerdao/rwa-portfolio") {
                    const result = await prisma.rWAPortfolio.create({
                        data: {
                            driveId: strand.driveId,
                            documentId: addFileInput.id,
                            principalLenderAccountId: "",
                        }
                    })
                    logger.info({ PortfolioID: result.id })
                    logger.info({ msg: "Adding file", operation });
                }
                break;
            case "DELETE_NODE":
                const deleteNodeInput = operation.input as DeleteNodeInput;
                const driveId = strand.driveId;
                logger.info(`Removing file ${deleteNodeInput.id} from ${driveId}`);
                const result = await prisma.rWAPortfolio.deleteMany({
                    where: {
                        AND: {
                            documentId: deleteNodeInput.id,
                            driveId
                        }
                    }
                })
                logger.info(`Removed ${result.count} portfolios`);
                logger.info({ msg: "Removing file", operation });
                break;
            default:
                logger.info(`Ignoring operation ${operation.type}`);
                break;
        }
    }
}

async function deleteDriveState(state: DocumentDriveState, prisma: Prisma.TransactionClient) {
    logger.info("Deleting rwa read model");
    await prisma.rWAPortfolio.deleteMany({
        where: {
            driveId: state.id
        }
    });
}

async function rebuildRwaPortfolio(driveId: string, documentId: string, state: RealWorldAssetsState, prisma: Prisma.TransactionClient) {
    const { transactions, principalLenderAccountId, fixedIncomeTypes, spvs, accounts, feeTypes, portfolio } = state;
    // create portfolio document
    const portfolioEntity = await prisma.rWAPortfolio.upsert({
        where: {
            driveId_documentId: {
                documentId,
                driveId
            }
        },
        create: {
            documentId,
            driveId,
            principalLenderAccountId: principalLenderAccountId,
        },
        update: {
            principalLenderAccountId: principalLenderAccountId,
        },
    });

    // create spvs
    await prisma.rWAPortfolioSpv.createMany({
        data: spvs.map((spv) => ({ ...spv, portfolioId: portfolioEntity.id })),
        skipDuplicates: true,
    });

    // create feeTypes
    await prisma.rWAPortfolioServiceProvider.createMany({
        data: feeTypes.map((feeType) => ({ ...feeType, portfolioId: portfolioEntity.id })),
        skipDuplicates: true,
    });

    // fixed income types
    await prisma.rWAPortfolioFixedIncomeType.createMany({
        data: fixedIncomeTypes.map((fixedIncomeType) => ({ ...fixedIncomeType, portfolioId: portfolioEntity.id })),
        skipDuplicates: true,
    });

    // create accounts
    await prisma.rWAPortfolioAccount.createMany({
        data: accounts.map((account) => ({ ...account, portfolioId: portfolioEntity.id })),
        skipDuplicates: true,
    });

    // create RWAPortfolioAsset
    await prisma.rWAPortfolioAsset.createMany({
        data: portfolio.map((asset) => ({ ...asset, assetRefId: asset.id, portfolioId: portfolioEntity.id, assetType: utils.isCashAsset(asset) ? "Cash" : "FixedIncome" })),
        skipDuplicates: true,
    });

    // create transactions
    // TODO: add transactions
    for (const transaction of transactions) {
        const isCashTx = ["PrincipalDraw", "PrincipalReturn"].includes(transaction.type);

        // Create Grpup TX Entity
        const groupTxEntity = await prisma.rWAGroupTransaction.create({
            data: {
                id: transaction.id,
                portfolioId: portfolioEntity.id,
                type: transaction.type
            },
        })

        // Create Cash and/or FixedIncome TX Entity
        // cashtx:


        // Create and Link Fee TX Entities
        console.log(transaction)
    }

    // add relationships
    await prisma.rWAPortfolioFixedIncomeTypeOnPortfolio.createMany({
        data: fixedIncomeTypes.map((fixedIncomeType) => ({
            fixedIncomeTypeId: fixedIncomeType.id,
            portfolioId: portfolioEntity.id,
        })),
        skipDuplicates: true,
    });

    await prisma.rWAPortfolioServiceProviderOnPortfolio.createMany({
        data: feeTypes.map((feeType) => ({ portfolioId: portfolioEntity.id, spvId: feeType.id })),
        skipDuplicates: true,
    });

    await prisma.rWAPortfolioSpvOnPortfolio.createMany({
        data: spvs.map((spv) => ({ portfolioId: portfolioEntity.id, spvId: spv.id })),
        skipDuplicates: true,
    });

    await prisma.rWAAccountOnPortfolio.createMany({
        data: accounts.map((account) => ({ portfolioId: portfolioEntity.id, accountId: account.id })),
        skipDuplicates: true,
    });

}

async function rwaPortfolioExists(driveId: string, documentId: string, prisma: Prisma.TransactionClient) {
    const portfolio = await prisma.rWAPortfolio.findFirst({
        where: {
            driveId,
            documentId
        }
    });

    return !!portfolio;
}

const surgicalOperations: Record<string, (input: any, portfolio: RWAPortfolio, prisma: Prisma.TransactionClient) => Promise<void>> = {
    "CREATE_FIXED_INCOME_ASSET": async (input: CreateFixedIncomeAssetInput, portfolio: RWAPortfolio, prisma: Prisma.TransactionClient) => {
        await prisma.rWAPortfolioAsset.create({
            data: {
                ...input,
                assetRefId: input.id,
                portfolioId: portfolio.id,
                assetType: "FixedIncome"
            }

        });

        logger.info({ msg: "Creating fixed income asset", input });
    },
}

async function handleRwaDocumentStrand(strand: InternalTransmitterUpdate<RealWorldAssetsDocument, "global">, prisma: Prisma.TransactionClient) {
    logger.info(`Received strand for document ${strand.documentId} with operations: ${strand.operations.map(op => op.type).join(", ")}`);
    if (!await rwaPortfolioExists(strand.driveId, strand.documentId, prisma)) {
        logger.info(`Skipping strand for document ${strand.documentId} as it doesn't exist in the read model`);
        return;
    }


    if (strandStartsFromOpZero(strand) || !allOperationsAreSurgical(strand, surgicalOperations)) {
        // await deleteDriveState(strand.state, prisma);
        await rebuildRwaPortfolio(strand.driveId, strand.documentId, strand.state, prisma);
    } else {
        const portfolio = await prisma.rWAPortfolio.findFirst({
            where: {
                driveId: strand.driveId,
                documentId: strand.documentId
            }
        })
        if (!portfolio) {
            logger.error({ msg: "Portfolio not found", driveId: strand.driveId, documentId: strand.documentId });
            return;
        }
        for (const operation of strand.operations) {
            await doSurgicalRwaPortfolioUpdate(operation, portfolio, prisma);
        }

    }
}

function doSurgicalRwaPortfolioUpdate(operation: OperationUpdate, portfolio: RWAPortfolio, prisma: Prisma.TransactionClient) {
    logger.info({ msg: "Doing surgical rwa portfolio update", name: operation.type });

    return;
}

function allOperationsAreSurgical(strand: InternalTransmitterUpdate<RealWorldAssetsDocument, "global">, surgicalOperations: Record<string, (input: any, portfolio: RWAPortfolio, prisma: Prisma.TransactionClient) => void>) {
    const allOperationsAreSurgical = strand.operations.filter(op => surgicalOperations[op.type] === undefined).length === 0;
    logger.info(`All operations are surgical: ${allOperationsAreSurgical}`);
    return allOperationsAreSurgical
}

