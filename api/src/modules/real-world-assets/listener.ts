import { Prisma, RWAPortfolio } from "@prisma/client";
import { InternalTransmitterUpdate, OperationUpdate } from "document-drive";
import { AddFileInput, DeleteNodeInput, DocumentDriveDocument, DocumentDriveState, ListenerFilter, actions } from "document-model-libs/document-drive";
import { CashGroupTransactionType, CreateAccountInput, CreateAssetPurchaseGroupTransactionInput, CreateAssetSaleGroupTransactionInput, CreateCashAssetInput, CreateFeesPaymentGroupTransactionInput, CreateFixedIncomeAssetInput, CreateFixedIncomeTypeInput, CreateInterestReturnGroupTransactionInput, CreatePrincipalDrawGroupTransactionInput, CreatePrincipalReturnGroupTransactionInput, CreateServiceProviderInput, CreateSpvInput, EditAccountInput, EditCashAssetInput, EditFixedIncomeAssetInput, EditFixedIncomeTypeInput, EditGroupTransactionTypeInput, EditPrincipalDrawGroupTransactionInput, EditServiceProviderInput, EditSpvInput, RealWorldAssetsDocument, RealWorldAssetsState, utils } from "document-model-libs/real-world-assets"
import { getChildLogger } from "../../logger";
import { Action } from "document-model/document";

const logger = getChildLogger({ msgPrefix: 'RWA Internal Listener' }, { moduleName: "RWA Internal Listener" });

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
    // logger.debug(strands);
    for (const strand of strands) {

        if (strand.documentId === "") {
            await handleDriveStrand(strand as InternalTransmitterUpdate<DocumentDriveDocument, "global">, prisma);
        } else {
            await handleRwaDocumentStrand(strand as InternalTransmitterUpdate<RealWorldAssetsDocument, "global">, prisma);
        }
    }
}



async function handleDriveStrand(strand: InternalTransmitterUpdate<DocumentDriveDocument, "global">, prisma: Prisma.TransactionClient) {
    logger.debug("Received strand for drive");
    if (strandStartsFromOpZero(strand)) {
        await deleteDriveState(strand.state, prisma);
    }

    await doSurgicalDriveUpdate(strand, prisma);
}

function strandStartsFromOpZero(strand: InternalTransmitterUpdate<DocumentDriveDocument | RealWorldAssetsDocument, "global">) {
    const resetNeeded = strand.operations.length > 0 && strand.operations[0].index === 0;
    logger.debug(`Reset needed: ${resetNeeded}`);
    return resetNeeded;
}
async function doSurgicalDriveUpdate(strand: InternalTransmitterUpdate<DocumentDriveDocument, "global">, prisma: Prisma.TransactionClient) {
    logger.debug("Doing surgical drive update");
    for (const operation of strand.operations) {
        logger.debug(`Operation: ${operation.type}`);
        switch (operation.type) {
            case "ADD_FILE":
                const addFileInput = operation.input as AddFileInput;
                if (addFileInput.documentType === "makerdao/rwa-portfolio") {
                    logger.debug({ msg: `Adding ${addFileInput.documentType}`, operation });
                    const document = utils.createDocument(addFileInput);
                    await rebuildRwaPortfolio(strand.driveId, addFileInput.id, document.state.global, prisma);
                }
                break;
            case "DELETE_NODE":
                const deleteNodeInput = operation.input as DeleteNodeInput;
                const driveId = strand.driveId;
                logger.debug(`Removing file ${deleteNodeInput.id} from ${driveId}`);
                const result = await prisma.rWAPortfolio.deleteMany({
                    where: {
                        AND: {
                            documentId: deleteNodeInput.id,
                            driveId
                        }
                    }
                })
                logger.debug(`Removed ${result.count} portfolios`);
                break;
            default:
                logger.debug(`Ignoring operation ${operation.type}`);
                break;
        }
    }
}

async function deleteDriveState(state: DocumentDriveState, prisma: Prisma.TransactionClient) {
    logger.debug("Deleting rwa read model");
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
        logger.debug({ msg: "Creating fixed income asset", input });
        await prisma.rWAPortfolioAsset.create({
            data: {
                ...input,
                assetRefId: input.id,
                portfolioId: portfolio.id,
                assetType: "FixedIncome"
            }

        });


    },
    "EDIT_FIXED_INCOME_ASSET": async (input: EditFixedIncomeAssetInput, portfolio: RWAPortfolio, prisma: Prisma.TransactionClient) => {
        logger.debug({ msg: "Editing fixed income asset", input });
        await prisma.rWAPortfolioAsset.update({
            where: {
                assetRefId_portfolioId: {
                    assetRefId: input.id,
                    portfolioId: portfolio.id
                }
            },
            data: {
                ...input,
            }
        });
    },
    "CREATE_SPV": async (input: CreateSpvInput, portfolio: RWAPortfolio, prisma: Prisma.TransactionClient) => {
        logger.debug({ msg: "Creating SPV", input });
        await prisma.rWAPortfolioSpv.create({
            data: {
                ...input,
                portfolioId: portfolio.id
            }
        });
    },
    "EDIT_SPV": async (input: EditSpvInput, portfolio: RWAPortfolio, prisma: Prisma.TransactionClient) => {
        logger.debug({ msg: "Editing SPV", input });
        await prisma.rWAPortfolioSpv.update({
            where: {
                id_portfolioId: {
                    id: input.id,
                    portfolioId: portfolio.id
                }
            },
            data: {
                ...input,
            }
        });
    },
    "CREATE_SERVICE_PROVIDER": async (input: CreateServiceProviderInput, portfolio: RWAPortfolio, prisma: Prisma.TransactionClient) => {
        logger.debug({ msg: "Creating service provider", input });
        await prisma.rWAPortfolioServiceProvider.create({
            data: {
                ...input,
                portfolioId: portfolio.id
            }
        });
    },
    "EDIT_SERVICE_PROVIDER": async (input: EditServiceProviderInput, portfolio: RWAPortfolio, prisma: Prisma.TransactionClient) => {
        logger.debug({ msg: "Editing service provider", input });
        await prisma.rWAPortfolioServiceProvider.update({
            where: {
                id_portfolioId: {
                    id: input.id,
                    portfolioId: portfolio.id
                }
            },
            data: {
                ...input,
                accountId: input.accountId ?? undefined,
                name: input.name ?? undefined,
                feeType: input.feeType ?? undefined,
            }
        });
    },
    "CREATE_ACCOUNT": async (input: CreateAccountInput, portfolio: RWAPortfolio, prisma: Prisma.TransactionClient) => {
        logger.debug({ msg: "Creating account", input });
        await prisma.rWAPortfolioAccount.create({
            data: {
                ...input,
                portfolioId: portfolio.id
            }
        });
    },
    "EDIT_ACCOUNT": async (input: EditAccountInput, portfolio: RWAPortfolio, prisma: Prisma.TransactionClient) => {
        logger.debug({ msg: "Editing account", input });
        await prisma.rWAPortfolioAccount.update({
            where: {
                id_portfolioId: {
                    id: input.id,
                    portfolioId: portfolio.id
                }
            },
            data: {
                ...input,
                reference: input.reference ?? undefined,
            }
        });
    },
    "CREATE_FIXED_INCOME_TYPE": async (input: CreateFixedIncomeTypeInput, portfolio: RWAPortfolio, prisma: Prisma.TransactionClient) => {
        logger.debug({ msg: "Creating fixed income type", input });
        await prisma.rWAPortfolioFixedIncomeType.create({
            data: {
                ...input,
                portfolioId: portfolio.id
            }
        });
    },
    "EDIT_FIXED_INCOME_TYPE": async (input: EditFixedIncomeTypeInput, portfolio: RWAPortfolio, prisma: Prisma.TransactionClient) => {
        logger.debug({ msg: "Editing fixed income type", input });
        await prisma.rWAPortfolioFixedIncomeType.update({
            where: {
                id_portfolioId: {
                    id: input.id,
                    portfolioId: portfolio.id
                }
            },
            data: {
                ...input,
                name: input.name ?? undefined,
            }
        });
    },
    "CREATE_CASH_ASSET": async (input: CreateCashAssetInput, portfolio: RWAPortfolio, prisma: Prisma.TransactionClient) => {
        logger.debug({ msg: "Creating cash asset", input });
        await prisma.rWAPortfolioAsset.create({
            data: {
                ...input,
                assetRefId: input.id,
                portfolioId: portfolio.id,
                assetType: "Cash"
            }
        });
    },
    "EDIT_CASH_ASSET": async (input: EditCashAssetInput, portfolio: RWAPortfolio, prisma: Prisma.TransactionClient) => {
        logger.debug({ msg: "Editing cash asset", input });
        await prisma.rWAPortfolioAsset.update({
            where: {
                assetRefId_portfolioId: {
                    assetRefId: input.id,
                    portfolioId: portfolio.id
                }
            },
            data: {
                ...input,
            }
        });
    },
    "CREATE_PRINCIPAL_DRAW_GROUP_TRANSACTION": async (input: CreatePrincipalDrawGroupTransactionInput, portfolio: RWAPortfolio, prisma: Prisma.TransactionClient) => {
        logger.debug({ msg: "Creating principal draw transaction", input });
        const { id } = await prisma.rWAGroupTransaction.create({
            data: {
                id: input.id,
                portfolioId: portfolio.id,
                type: "PrincipalDraw",
            }
        });

        for (const feeTx of input.feeTransactions ?? []) {
            const feeTxEntity = await prisma.rWABaseTransaction.create({
                data: {
                    ...feeTx,
                    portfolioId: portfolio.id,
                }
            });

            await prisma.rWABaseTransactionOnGroupTransaction.create({
                data: {
                    portfolioId: portfolio.id,
                    baseTransactionId: feeTxEntity.id,
                    groupTransactionId: id,
                }
            });
        }

        if (input.cashTransaction) {
            const cashTxEntity = await prisma.rWABaseTransaction.create({
                data: {
                    ...input.cashTransaction,
                    portfolioId: portfolio.id,
                }
            });

            await prisma.rWABaseTransactionOnGroupTransaction.create({
                data: {
                    portfolioId: portfolio.id,
                    baseTransactionId: cashTxEntity.id,
                    groupTransactionId: id,
                }
            });

        }
    },
    "CREATE_PRINCIPAL_RETURN_GROUP_TRANSACTION": async (input: CreatePrincipalReturnGroupTransactionInput, portfolio: RWAPortfolio, prisma: Prisma.TransactionClient) => {
        logger.debug({ msg: "Creating principal return transaction", input });
        const { id } = await prisma.rWAGroupTransaction.create({
            data: {
                id: input.id,
                portfolioId: portfolio.id,
                type: "PrincipalReturn",
            }
        });

        for (const feeTx of input.feeTransactions ?? []) {
            const feeTxEntity = await prisma.rWABaseTransaction.create({
                data: {
                    ...feeTx,
                    portfolioId: portfolio.id,
                }
            });

            await prisma.rWABaseTransactionOnGroupTransaction.create({
                data: {
                    portfolioId: portfolio.id,
                    baseTransactionId: feeTxEntity.id,
                    groupTransactionId: id,
                }
            });
        }

        if (input.cashTransaction) {
            const cashTxEntity = await prisma.rWABaseTransaction.create({
                data: {
                    ...input.cashTransaction,
                    portfolioId: portfolio.id,
                }
            });

            await prisma.rWABaseTransactionOnGroupTransaction.create({
                data: {
                    portfolioId: portfolio.id,
                    baseTransactionId: cashTxEntity.id,
                    groupTransactionId: id,
                }
            });

        }
    },
    "CREATE_ASSET_PURCHASE_GROUP_TRANSACTION": async (input: CreateAssetPurchaseGroupTransactionInput, portfolio: RWAPortfolio, prisma: Prisma.TransactionClient) => {
        logger.debug({ msg: "Creating asset purchase transaction", input });
        const { id } = await prisma.rWAGroupTransaction.create({
            data: {
                id: input.id,
                portfolioId: portfolio.id,
                type: "AssetPurchase",
            }
        });

        for (const feeTx of input.feeTransactions ?? []) {
            const feeTxEntity = await prisma.rWABaseTransaction.create({
                data: {
                    ...feeTx,
                    portfolioId: portfolio.id,
                }
            });

            await prisma.rWABaseTransactionOnGroupTransaction.create({
                data: {
                    portfolioId: portfolio.id,
                    baseTransactionId: feeTxEntity.id,
                    groupTransactionId: id,
                }
            });
        }

        if (input.cashTransaction) {
            const cashTxEntity = await prisma.rWABaseTransaction.create({
                data: {
                    ...input.cashTransaction,
                    portfolioId: portfolio.id,
                }
            });

            await prisma.rWABaseTransactionOnGroupTransaction.create({
                data: {
                    portfolioId: portfolio.id,
                    baseTransactionId: cashTxEntity.id,
                    groupTransactionId: id,
                }
            });

        }
    },
    "CREATE_ASSET_SALE_GROUP_TRANSACTION": async (input: CreateAssetSaleGroupTransactionInput, portfolio: RWAPortfolio, prisma: Prisma.TransactionClient) => {
        logger.debug({ msg: "Creating asset sale transaction", input });
        const { id } = await prisma.rWAGroupTransaction.create({
            data: {
                id: input.id,
                portfolioId: portfolio.id,
                type: "AssetSale",
            }
        });

        for (const feeTx of input.feeTransactions ?? []) {
            const feeTxEntity = await prisma.rWABaseTransaction.create({
                data: {
                    ...feeTx,
                    portfolioId: portfolio.id,
                }
            });

            await prisma.rWABaseTransactionOnGroupTransaction.create({
                data: {
                    portfolioId: portfolio.id,
                    baseTransactionId: feeTxEntity.id,
                    groupTransactionId: id,
                }
            });
        }

        if (input.cashTransaction) {
            const cashTxEntity = await prisma.rWABaseTransaction.create({
                data: {
                    ...input.cashTransaction,
                    portfolioId: portfolio.id,
                }
            });

            await prisma.rWABaseTransactionOnGroupTransaction.create({
                data: {
                    portfolioId: portfolio.id,
                    baseTransactionId: cashTxEntity.id,
                    groupTransactionId: id,
                }
            });

        }
    },
    "CREATE_INTEREST_DRAW_GROUP_TRANSACTION": async (input: CreatePrincipalDrawGroupTransactionInput, portfolio: RWAPortfolio, prisma: Prisma.TransactionClient) => {
        logger.debug({ msg: "Creating interest draw transaction", input });
        const { id } = await prisma.rWAGroupTransaction.create({
            data: {
                id: input.id,
                portfolioId: portfolio.id,
                type: "InterestDraw",
            }
        });

        for (const feeTx of input.feeTransactions ?? []) {
            const feeTxEntity = await prisma.rWABaseTransaction.create({
                data: {
                    ...feeTx,
                    portfolioId: portfolio.id,
                }
            });

            await prisma.rWABaseTransactionOnGroupTransaction.create({
                data: {
                    portfolioId: portfolio.id,
                    baseTransactionId: feeTxEntity.id,
                    groupTransactionId: id,
                }
            });
        }

        if (input.cashTransaction) {
            const cashTxEntity = await prisma.rWABaseTransaction.create({
                data: {
                    ...input.cashTransaction,
                    portfolioId: portfolio.id,
                }
            });

            await prisma.rWABaseTransactionOnGroupTransaction.create({
                data: {
                    portfolioId: portfolio.id,
                    baseTransactionId: cashTxEntity.id,
                    groupTransactionId: id,
                }
            });

        }
    },
    "CREATE_INTEREST_RETURN_GROUP_TRANSACTION": async (input: CreateInterestReturnGroupTransactionInput, portfolio: RWAPortfolio, prisma: Prisma.TransactionClient) => {
        logger.debug({ msg: "Creating interest return transaction", input });
        const { id } = await prisma.rWAGroupTransaction.create({
            data: {
                id: input.id,
                portfolioId: portfolio.id,
                type: "InterestReturn",
            }
        });

        if (input.interestTransaction) {
            const interestTxEntity = await prisma.rWABaseTransaction.create({
                data: {
                    ...input.interestTransaction,
                    portfolioId: portfolio.id,
                }
            });

            await prisma.rWABaseTransactionOnGroupTransaction.create({
                data: {
                    portfolioId: portfolio.id,
                    baseTransactionId: interestTxEntity.id,
                    groupTransactionId: id,
                }
            });
        }
    },
    "CREATE_FEES_PAYMENT_GROUP_TRANSACTION": async (input: CreateFeesPaymentGroupTransactionInput, portfolio: RWAPortfolio, prisma: Prisma.TransactionClient) => {
        logger.debug({ msg: "Creating fees payment transaction", input });
        const { id } = await prisma.rWAGroupTransaction.create({
            data: {
                id: input.id,
                portfolioId: portfolio.id,
                type: "FeesPayment",
            }
        });

        for (const feeTx of input.feeTransactions ?? []) {
            const feeTxEntity = await prisma.rWABaseTransaction.create({
                data: {
                    ...feeTx,
                    portfolioId: portfolio.id,
                }
            });

            await prisma.rWABaseTransactionOnGroupTransaction.create({
                data: {
                    portfolioId: portfolio.id,
                    baseTransactionId: feeTxEntity.id,
                    groupTransactionId: id,
                }
            });
        }
    },
    "EDIT_GROUP_TRANSACTION_TYPE": async (input: EditGroupTransactionTypeInput, portfolio: RWAPortfolio, prisma: Prisma.TransactionClient) => {
        logger.debug({ msg: "Editing group transaction type", input });
        await prisma.rWAGroupTransaction.update({
            where: {
                id_portfolioId: {
                    id: input.id,
                    portfolioId: portfolio.id
                }
            },
            data: {
                type: input.type,
            }
        });
    },

}

async function handleRwaDocumentStrand(strand: InternalTransmitterUpdate<RealWorldAssetsDocument, "global">, prisma: Prisma.TransactionClient) {
    logger.debug(`Received strand for document ${strand.documentId} with operations: ${strand.operations.map(op => op.type).join(", ")}`);
    if (!await rwaPortfolioExists(strand.driveId, strand.documentId, prisma)) {
        logger.debug(`Skipping strand for document ${strand.documentId} as it doesn't exist in the read model`);
        return;
    }


    if (strandStartsFromOpZero(strand) || !allOperationsAreSurgical(strand, surgicalOperations)) {
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

async function doSurgicalRwaPortfolioUpdate(operation: OperationUpdate, portfolio: RWAPortfolio, prisma: Prisma.TransactionClient) {
    logger.debug({ msg: "Doing surgical rwa portfolio update", name: operation.type });
    await surgicalOperations[operation.type](operation.input, portfolio, prisma);
}

function allOperationsAreSurgical(strand: InternalTransmitterUpdate<RealWorldAssetsDocument, "global">, surgicalOperations: Record<string, (input: any, portfolio: RWAPortfolio, prisma: Prisma.TransactionClient) => void>) {
    const allOperationsAreSurgical = strand.operations.filter(op => surgicalOperations[op.type] === undefined).length === 0;
    logger.debug(`All operations are surgical: ${allOperationsAreSurgical}`);
    return allOperationsAreSurgical
}

