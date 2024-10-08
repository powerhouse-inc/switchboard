import { Prisma, RWAPortfolio } from '@prisma/client';
import { InternalTransmitterUpdate, OperationUpdate } from 'document-drive';
import {
  AddFileInput,
  DeleteNodeInput,
  DocumentDriveDocument,
  DocumentDriveState
} from 'document-model-libs/document-drive';
import {
  AddFeesToGroupTransactionInput,
  Asset,
  CreateAccountInput,
  CreateCashAssetInput,
  CreateFixedIncomeAssetInput,
  CreateFixedIncomeTypeInput,
  CreateGroupTransactionInput,
  CreateServiceProviderFeeTypeInput,
  CreateSpvInput,
  DeleteAccountInput,
  DeleteCashAssetInput,
  DeleteFixedIncomeAssetInput,
  DeleteGroupTransactionInput,
  DeleteServiceProviderFeeTypeInput,
  DeleteSpvInput,
  EditAccountInput,
  EditCashAssetInput,
  EditFixedIncomeAssetInput,
  EditFixedIncomeTypeInput,
  EditGroupTransactionFeesInput,
  EditGroupTransactionInput,
  EditServiceProviderFeeTypeInput,
  EditSpvInput,
  RealWorldAssetsDocument,
  RealWorldAssetsState,
  RemoveFeesFromGroupTransactionInput,
  Spv,
  utils
} from 'document-model-libs/real-world-assets';
import { getChildLogger } from '../../logger';

const logger = getChildLogger(
  { msgPrefix: 'RWA Internal Listener' },
  { moduleName: 'RWA Internal Listener' }
);

export const options: IReceiverOptions = {
  listenerId: 'real-world-assets',
  filter: {
    branch: ['main'],
    documentId: ['*'],
    documentType: ['makerdao/rwa-portfolio', 'powerhouse/document-drive'],
    scope: ['*']
  },
  block: false,
  label: 'real-world-assets'
};

export async function transmit(
  strands: InternalTransmitterUpdate<
    RealWorldAssetsDocument | DocumentDriveDocument,
    'global'
  >[],
  prisma: Prisma.TransactionClient
) {
  // logger.debug(strands);
  for (const strand of strands) {
    try {
      if (strand.documentId === '') {
        await handleDriveStrand(
          strand as InternalTransmitterUpdate<DocumentDriveDocument, 'global'>,
          prisma
        );
      } else {
        await handleRwaDocumentStrand(
          strand as InternalTransmitterUpdate<
            RealWorldAssetsDocument,
            'global'
          >,
          prisma
        );
      }
    } catch (e) {
      logger.error({ msg: 'Error processing strand', error: e });
      continue;
    }
  }
}

async function handleDriveStrand(
  strand: InternalTransmitterUpdate<DocumentDriveDocument, 'global'>,
  prisma: Prisma.TransactionClient
) {
  logger.debug('Received strand for drive');
  if (strandStartsFromOpZero(strand)) {
    await deleteDriveState(strand.state, prisma);
  }

  await doSurgicalDriveUpdate(strand, prisma);
}

function strandStartsFromOpZero(
  strand: InternalTransmitterUpdate<
    DocumentDriveDocument | RealWorldAssetsDocument,
    'global'
  >
) {
  const resetNeeded =
    strand.operations.length > 0 &&
    (strand.operations[0].index === 0 ||
      strand.operations[strand.operations.length - 1].index -
        strand.operations[strand.operations.length - 1].skip ===
        0);
  logger.debug(`Reset needed: ${resetNeeded}`);
  return resetNeeded;
}
async function doSurgicalDriveUpdate(
  strand: InternalTransmitterUpdate<DocumentDriveDocument, 'global'>,
  prisma: Prisma.TransactionClient
) {
  logger.debug('Doing surgical drive update');
  for (const operation of strand.operations) {
    logger.debug(`Operation: ${operation.type}`);
    switch (operation.type) {
      case 'ADD_FILE':
        const addFileInput = operation.input as AddFileInput;
        if (addFileInput.documentType === 'makerdao/rwa-portfolio') {
          logger.debug({
            msg: `Adding ${addFileInput.documentType}`,
            operation
          });
          const document = utils.createDocument(addFileInput);
          await rebuildRwaPortfolio(
            strand.driveId,
            addFileInput.id,
            document.state.global,
            prisma
          );
        }
        break;
      case 'DELETE_NODE':
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
        });
        logger.debug(`Removed ${result.count} portfolios`);
        break;
      default:
        logger.debug(`Ignoring operation ${operation.type}`);
        break;
    }
  }
}

async function deleteDriveState(
  state: DocumentDriveState,
  prisma: Prisma.TransactionClient
) {
  logger.debug('Deleting rwa read model');
  await prisma.rWAPortfolio.deleteMany({
    where: {
      driveId: state.id
    }
  });
}

async function rebuildRwaPortfolio(
  driveId: string,
  documentId: string,
  state: RealWorldAssetsState,
  prisma: Prisma.TransactionClient
) {
  const {
    transactions,
    principalLenderAccountId,
    fixedIncomeTypes,
    spvs,
    accounts,
    serviceProviderFeeTypes,
    portfolio
  } = state;

  logger.debug({ msg: 'rebuild portfolio', state });
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
      principalLenderAccountId: principalLenderAccountId
    },
    update: {
      principalLenderAccountId: principalLenderAccountId
    }
  });

  // create spvs
  await prisma.rWAPortfolioSpv.createMany({
    data: spvs.map((spv: Spv) => ({ ...spv, portfolioId: portfolioEntity.id })),
    skipDuplicates: true
  });

  // create accounts
  await prisma.rWAPortfolioAccount.createMany({
    data: accounts.map(account => ({
      ...account,
      portfolioId: portfolioEntity.id
    })),
    skipDuplicates: true
  });

  // create feeTypes
  await prisma.rWAPortfolioServiceProviderFeeType.createMany({
    data: serviceProviderFeeTypes.map(feeType => ({
      ...feeType,
      portfolioId: portfolioEntity.id,
      id: feeType.id,
      accountId: feeType.accountId
    })),
    skipDuplicates: true
  });

  // fixed income types
  await prisma.rWAPortfolioFixedIncomeType.createMany({
    data: fixedIncomeTypes.map(fixedIncomeType => ({
      ...fixedIncomeType,
      portfolioId: portfolioEntity.id
    })),
    skipDuplicates: true
  });

  // create RWAPortfolioAsset
  await prisma.rWAPortfolioAsset.createMany({
    data: portfolio.map((asset: Asset) => ({
      ...asset,
      assetRefId: asset.id,
      portfolioId: portfolioEntity.id,
      assetType: utils.isCashAsset(asset) ? 'Cash' : 'FixedIncome',
      purchaseDate: !utils.isCashAsset(asset)
        ? asset.purchaseDate === ''
          ? undefined
          : asset.purchaseDate
        : undefined,
      spvId: !utils.isCashAsset(asset) ? asset.spvId : undefined
    })),
    skipDuplicates: true
  });

  // create transactions
  logger.debug({ msg: 'Creating transactions', transactions });
  for (const transaction of transactions) {
    let cashTxEntity;
    // let feeTxEntities = [];
    let interestTxEntity;
    let fixedIncomeTxEntity;

    // cash transaction
    if (transaction.cashTransaction) {
      cashTxEntity = await prisma.rWABaseTransaction.create({
        data: {
          ...transaction.cashTransaction,
          portfolioId: portfolioEntity.id
        }
      });
    }

    // fee transactions
    const feeTxEntities = [];
    for (const feeTx of transaction.fees ?? []) {
      feeTxEntities.push(
        await prisma.rWABaseTransaction.create({
          data: {
            amount: feeTx.amount,
            id: feeTx.id ?? undefined,
            portfolioId: portfolioEntity.id
          }
        })
      );
    }

    // fixed income transaction
    if (transaction.fixedIncomeTransaction) {
      fixedIncomeTxEntity = await prisma.rWABaseTransaction.create({
        data: {
          ...transaction.fixedIncomeTransaction,
          portfolioId: portfolioEntity.id
        }
      });
    }

    // Create Grpup TX Entity
    const groupTxEntity = await prisma.rWAGroupTransaction.create({
      data: {
        id: transaction.id,
        portfolioId: portfolioEntity.id,
        type: transaction.type,
        cashTransactionId: cashTxEntity?.id ?? undefined,
        fixedIncomeTransactionId: fixedIncomeTxEntity?.id ?? undefined,
        entryTime: transaction.entryTime,

        unitPrice: transaction.unitPrice?.toString() ?? undefined,
        cashBalanceChange: transaction.cashBalanceChange.toString()
      }
    });

    // add fees
    if (transaction.fees) {
      await prisma.rWAGroupTransactionFee.createMany({
        data: transaction.fees.map(fee => ({
          ...fee,
          portfolioId: portfolioEntity.id,
          groupTransactionId: transaction.id,
          id: fee.id ?? undefined
        }))
      });
    }

    // add relationships for fees
    for (const feeTxEntity of feeTxEntities) {
      await prisma.rWABaseTransactionOnGroupTransaction.create({
        data: {
          portfolioId: portfolioEntity.id,
          baseTransactionId: feeTxEntity.id,
          groupTransactionId: groupTxEntity.id
        }
      });
    }
  }

  // add relationships
  await prisma.rWAPortfolioFixedIncomeTypeOnPortfolio.createMany({
    data: fixedIncomeTypes.map(fixedIncomeType => ({
      fixedIncomeTypeId: fixedIncomeType.id,
      portfolioId: portfolioEntity.id
    })),
    skipDuplicates: true
  });

  await prisma.rWAPortfolioSpvOnPortfolio.createMany({
    data: spvs.map(spv => ({ portfolioId: portfolioEntity.id, spvId: spv.id })),
    skipDuplicates: true
  });

  await prisma.rWAAccountOnPortfolio.createMany({
    data: accounts.map(account => ({
      portfolioId: portfolioEntity.id,
      accountId: account.id
    })),
    skipDuplicates: true
  });
}

const surgicalOperations: Record<
  string,
  (
    input: any,
    portfolio: RWAPortfolio,
    prisma: Prisma.TransactionClient
  ) => Promise<void>
> = {
  CREATE_FIXED_INCOME_ASSET: async (
    input: CreateFixedIncomeAssetInput,
    portfolio: RWAPortfolio,
    prisma: Prisma.TransactionClient
  ) => {
    logger.debug({ msg: 'Creating fixed income asset', input });
    await prisma.rWAPortfolioAsset.create({
      data: {
        ...input,
        assetRefId: input.id,
        portfolioId: portfolio.id,
        assetType: 'FixedIncome'
      }
    });
  },
  EDIT_FIXED_INCOME_ASSET: async (
    input: EditFixedIncomeAssetInput,
    portfolio: RWAPortfolio,
    prisma: Prisma.TransactionClient
  ) => {
    logger.debug({ msg: 'Editing fixed income asset', input });
    await prisma.rWAPortfolioAsset.update({
      where: {
        assetRefId_portfolioId: {
          assetRefId: input.id,
          portfolioId: portfolio.id
        }
      },
      data: {
        ...input
      }
    });
  },
  CREATE_SPV: async (
    input: CreateSpvInput,
    portfolio: RWAPortfolio,
    prisma: Prisma.TransactionClient
  ) => {
    logger.debug({ msg: 'Creating SPV', input });
    await prisma.rWAPortfolioSpv.create({
      data: {
        ...input,
        portfolioId: portfolio.id
      }
    });

    await prisma.rWAPortfolioSpvOnPortfolio.create({
      data: {
        portfolioId: portfolio.id,
        spvId: input.id
      }
    });
  },
  EDIT_SPV: async (
    input: EditSpvInput,
    portfolio: RWAPortfolio,
    prisma: Prisma.TransactionClient
  ) => {
    logger.debug({ msg: 'Editing SPV', input });
    await prisma.rWAPortfolioSpv.update({
      where: {
        id_portfolioId: {
          id: input.id,
          portfolioId: portfolio.id
        }
      },
      data: {
        ...input
      }
    });
  },
  DELETE_SPV: async (
    input: DeleteSpvInput,
    portfolio: RWAPortfolio,
    prisma: Prisma.TransactionClient
  ) => {
    logger.debug({ msg: 'Deleting SPV', input });
    await prisma.rWAPortfolioSpvOnPortfolio.delete({
      where: {
        spvId_portfolioId: {
          portfolioId: portfolio.id,
          spvId: input.id
        }
      }
    });

    await prisma.rWAPortfolioSpv.delete({
      where: {
        id_portfolioId: {
          id: input.id,
          portfolioId: portfolio.id
        }
      }
    });
  },
  CREATE_SERVICE_PROVIDER_FEE_TYPE: async (
    input: CreateServiceProviderFeeTypeInput,
    portfolio: RWAPortfolio,
    prisma: Prisma.TransactionClient
  ) => {
    logger.debug({ msg: 'Creating service provider', input });
    try {
      await prisma.rWAPortfolioServiceProviderFeeType.create({
        data: {
          ...input,
          portfolioId: portfolio.id
        }
      });
      await prisma.rWAPortfolioServiceProviderOnPortfolio.create({
        data: {
          portfolioId: portfolio.id,
          spvId: input.id
        }
      });
    } catch (e) {
      logger.debug(e);
    }
  },
  EDIT_SERVICE_PROVIDER_FEE_TYPE: async (
    input: EditServiceProviderFeeTypeInput,
    portfolio: RWAPortfolio,
    prisma: Prisma.TransactionClient
  ) => {
    logger.debug({ msg: 'Editing service provider', input });
    const updateFields: Record<string, string> = {};
    if (input.accountId) {
      updateFields.accountId = input.accountId;
    }
    if (input.name) {
      updateFields.name = input.name;
    }
    if (input.feeType) {
      updateFields.feeType = input.feeType;
    }

    await prisma.rWAPortfolioServiceProviderFeeType.update({
      where: {
        id_portfolioId: {
          id: input.id,
          portfolioId: portfolio.id
        }
      },
      data: {
        ...updateFields
      }
    });
  },
  DELETE_SERVICE_PROVIDER_FEE_TYPE: async (
    input: DeleteServiceProviderFeeTypeInput,
    portfolio: RWAPortfolio,
    prisma: Prisma.TransactionClient
  ) => {
    logger.debug({ msg: 'Deleting service provider', input });
    await prisma.rWAPortfolioServiceProviderOnPortfolio.delete({
      where: {
        spvId_portfolioId: {
          portfolioId: portfolio.id,
          spvId: input.id
        }
      }
    });

    await prisma.rWAPortfolioServiceProviderFeeType.delete({
      where: {
        id_portfolioId: {
          id: input.id,
          portfolioId: portfolio.id
        }
      }
    });
  },
  CREATE_ACCOUNT: async (
    input: CreateAccountInput,
    portfolio: RWAPortfolio,
    prisma: Prisma.TransactionClient
  ) => {
    logger.debug({ msg: 'Creating account', input });
    await prisma.rWAPortfolioAccount.create({
      data: {
        ...input,
        portfolioId: portfolio.id
      }
    });

    await prisma.rWAAccountOnPortfolio.create({
      data: {
        portfolioId: portfolio.id,
        accountId: input.id
      }
    });
  },
  EDIT_ACCOUNT: async (
    input: EditAccountInput,
    portfolio: RWAPortfolio,
    prisma: Prisma.TransactionClient
  ) => {
    logger.debug({ msg: 'Editing account', input });
    await prisma.rWAPortfolioAccount.update({
      where: {
        id_portfolioId: {
          id: input.id,
          portfolioId: portfolio.id
        }
      },
      data: {
        ...input,
        reference: input.reference ?? undefined
      }
    });
  },
  DELETE_ACCOUNT: async (
    input: DeleteAccountInput,
    portfolio: RWAPortfolio,
    prisma: Prisma.TransactionClient
  ) => {
    logger.debug({ msg: 'Deleting account', input });

    await prisma.rWAAccountOnPortfolio.delete({
      where: {
        accountId_portfolioId: {
          portfolioId: portfolio.id,
          accountId: input.id
        }
      }
    });

    await prisma.rWAPortfolioAccount.delete({
      where: {
        id_portfolioId: {
          id: input.id,
          portfolioId: portfolio.id
        }
      }
    });
  },
  CREATE_FIXED_INCOME_TYPE: async (
    input: CreateFixedIncomeTypeInput,
    portfolio: RWAPortfolio,
    prisma: Prisma.TransactionClient
  ) => {
    logger.debug({ msg: 'Creating fixed income type', input });
    await prisma.rWAPortfolioFixedIncomeType.create({
      data: {
        ...input,
        portfolioId: portfolio.id
      }
    });
    await prisma.rWAPortfolioFixedIncomeTypeOnPortfolio.create({
      data: {
        portfolioId: portfolio.id,
        fixedIncomeTypeId: input.id
      }
    });
  },
  EDIT_FIXED_INCOME_TYPE: async (
    input: EditFixedIncomeTypeInput,
    portfolio: RWAPortfolio,
    prisma: Prisma.TransactionClient
  ) => {
    logger.debug({ msg: 'Editing fixed income type', input });
    await prisma.rWAPortfolioFixedIncomeType.update({
      where: {
        id_portfolioId: {
          id: input.id,
          portfolioId: portfolio.id
        }
      },
      data: {
        ...input,
        name: input.name ?? undefined
      }
    });
  },
  DELETE_FIXED_INCOME_TYPE: async (
    input: DeleteFixedIncomeAssetInput,
    portfolio: RWAPortfolio,
    prisma: Prisma.TransactionClient
  ) => {
    await prisma.rWAPortfolioFixedIncomeTypeOnPortfolio.delete({
      where: {
        fixedIncomeTypeId_portfolioId: {
          portfolioId: portfolio.id,
          fixedIncomeTypeId: input.id
        }
      }
    });
    await prisma.rWAPortfolioFixedIncomeType.delete({
      where: {
        id_portfolioId: {
          id: input.id,
          portfolioId: portfolio.id
        }
      }
    });
  },
  DELETE_FIXED_INCOME_ASSET: async (
    input: DeleteFixedIncomeAssetInput,
    portfolio: RWAPortfolio,
    prisma: Prisma.TransactionClient
  ) => {
    logger.debug({ msg: 'Deleting fixed income asset', input });
    await prisma.rWAPortfolioAsset.delete({
      where: {
        assetRefId_portfolioId: {
          assetRefId: input.id,
          portfolioId: portfolio.id
        }
      }
    });
  },
  CREATE_CASH_ASSET: async (
    input: CreateCashAssetInput,
    portfolio: RWAPortfolio,
    prisma: Prisma.TransactionClient
  ) => {
    logger.debug({ msg: 'Creating cash asset', input });
    await prisma.rWAPortfolioAsset.create({
      data: {
        ...input,
        assetRefId: input.id,
        portfolioId: portfolio.id,
        assetType: 'Cash'
      }
    });
  },
  EDIT_CASH_ASSET: async (
    input: EditCashAssetInput,
    portfolio: RWAPortfolio,
    prisma: Prisma.TransactionClient
  ) => {
    logger.debug({ msg: 'Editing cash asset', input });
    await prisma.rWAPortfolioAsset.update({
      where: {
        assetRefId_portfolioId: {
          assetRefId: input.id,
          portfolioId: portfolio.id
        }
      },
      data: {
        ...input
      }
    });
  },
  DELETE_CASH_ASSET: async (
    input: DeleteCashAssetInput,
    portfolio: RWAPortfolio,
    prisma: Prisma.TransactionClient
  ) => {
    logger.debug({ msg: 'Deleting cash asset', input });
    await prisma.rWAPortfolioAsset.delete({
      where: {
        assetRefId_portfolioId: {
          assetRefId: input.id,
          portfolioId: portfolio.id
        }
      }
    });
  },
  CREATE_GROUP_TRANSACTION: async (
    input: CreateGroupTransactionInput,
    portfolio: RWAPortfolio,
    prisma: Prisma.TransactionClient
  ) => {
    logger.debug({ msg: 'Creating Group transaction', input });
    const { id } = await prisma.rWAGroupTransaction.create({
      data: {
        id: input.id,
        portfolioId: portfolio.id,
        type: input.type,
        entryTime: input.entryTime,
        cashBalanceChange: input.cashBalanceChange.toString(),
        unitPrice: input.unitPrice?.toString() ?? undefined
      }
    });

    for (const feeTx of input.fees ?? []) {
      const { amount, serviceProviderFeeTypeId } = feeTx;
      const feeTxEntity = await prisma.rWABaseTransaction.create({
        data: {
          id: id ?? undefined,
          amount: amount,
          portfolioId: portfolio.id
        }
      });

      await prisma.rWABaseTransactionOnGroupTransaction.create({
        data: {
          portfolioId: portfolio.id,
          baseTransactionId: feeTxEntity.id,
          groupTransactionId: id
        }
      });
    }

    if (input.cashTransaction) {
      const cashTxEntity = await prisma.rWABaseTransaction.create({
        data: {
          ...input.cashTransaction,
          portfolioId: portfolio.id
        }
      });

      await prisma.rWAGroupTransaction.update({
        where: {
          id_portfolioId: {
            id: id,
            portfolioId: portfolio.id
          }
        },
        data: {
          portfolioId: portfolio.id,
          cashTransactionId: cashTxEntity.id
        }
      });
    }

    if (input.fixedIncomeTransaction) {
      const interestTxEntity = await prisma.rWABaseTransaction.create({
        data: {
          ...input.fixedIncomeTransaction,
          portfolioId: portfolio.id
        }
      });

      await prisma.rWAGroupTransaction.update({
        where: {
          id_portfolioId: {
            id: id,
            portfolioId: portfolio.id
          }
        },
        data: {
          portfolioId: portfolio.id,
          fixedIncomeTransactionId: interestTxEntity.id
        }
      });
    }
  },
  EDIT_GROUP_TRANSACTION: async (
    input: EditGroupTransactionInput,
    portfolio: RWAPortfolio,
    prisma: Prisma.TransactionClient
  ) => {
    logger.debug({ msg: 'Editing principal draw transaction', input });
    const updateData: Record<string, string> = {};
    if (input.type) {
      updateData.type = input.type;
    }
    if (input.entryTime) {
      updateData.entryTime = input.entryTime;
    }

    const { id } = await prisma.rWAGroupTransaction.update({
      where: {
        id_portfolioId: {
          id: input.id,
          portfolioId: portfolio.id
        }
      },
      data: {
        ...updateData
      }
    });

    // for (const feeTx of input.feeTransactions ?? []) {
    //     await prisma.rWABaseTransaction.update({
    //         where: {
    //             id_portfolioId: {
    //                 id: input.id,
    //                 portfolioId: portfolio.id
    //             }
    //         },
    //         data: {
    //             ...feeTx,
    //             portfolioId: portfolio.id,
    //         }
    //     });
    // }

    if (input.cashTransaction) {
      const cashTxEntity = await prisma.rWABaseTransaction.upsert({
        where: {
          id_portfolioId: {
            id: input.cashTransaction.id,
            portfolioId: portfolio.id
          }
        },
        create: {
          ...input.cashTransaction,
          portfolioId: portfolio.id
        },
        update: {
          ...input.cashTransaction,
          portfolioId: portfolio.id
        }
      });

      await prisma.rWAGroupTransaction.update({
        where: {
          id_portfolioId: {
            id: id,
            portfolioId: portfolio.id
          }
        },
        data: {
          portfolioId: portfolio.id,
          cashTransactionId: cashTxEntity.id
        }
      });
    }

    if (input.fixedIncomeTransaction) {
      const interestTxEntity = await prisma.rWABaseTransaction.upsert({
        where: {
          id_portfolioId: {
            id: input.fixedIncomeTransaction.id,
            portfolioId: portfolio.id
          }
        },
        create: {
          ...input.fixedIncomeTransaction,
          portfolioId: portfolio.id
        },
        update: {
          ...input.fixedIncomeTransaction,
          portfolioId: portfolio.id
        }
      });

      await prisma.rWAGroupTransaction.update({
        where: {
          id_portfolioId: {
            id: id,
            portfolioId: portfolio.id
          }
        },
        data: {
          portfolioId: portfolio.id,
          fixedIncomeTransactionId: interestTxEntity.id
        }
      });
    }

    // if (input.interestTransaction) {
    //     const interestTxEntity = await prisma.rWABaseTransaction.upsert({
    //         where: {
    //             id_portfolioId: {
    //                 id: input.interestTransaction.id,
    //                 portfolioId: portfolio.id
    //             }
    //         },
    //         create: {
    //             ...input.interestTransaction,
    //             portfolioId: portfolio.id,
    //         },
    //         update: {
    //             ...input.interestTransaction,
    //             portfolioId: portfolio.id,
    //         }
    //     });

    //     await prisma.rWAGroupTransaction.update({
    //         where: {
    //             id_portfolioId: {
    //                 id: id,
    //                 portfolioId: portfolio.id
    //             }
    //         },
    //         data: {
    //             portfolioId: portfolio.id,
    //             interestTransactionId: interestTxEntity.id,
    //         }
    //     });
    // }
  },

  ADD_FEES_TO_GROUP_TRANSACTION: async (
    input: AddFeesToGroupTransactionInput,
    portfolio: RWAPortfolio,
    prisma: Prisma.TransactionClient
  ) => {
    logger.debug({
      msg: 'Adding fee transactions to group transaction',
      input
    });
    // add fees
    if (!input.fees) {
      return;
    }

    await prisma.rWAGroupTransactionFee.createMany({
      data: input.fees.map(fee => ({
        ...fee,
        portfolioId: portfolio.id,
        groupTransactionId: input.id,
        id: fee.id ?? undefined
      }))
    });
  },
  EDIT_GROUP_TRANSACTION_FEES: async (
    input: EditGroupTransactionFeesInput,
    portfolio: RWAPortfolio,
    prisma: Prisma.TransactionClient
  ) => {
    logger.debug({ msg: 'Editing fee transaction', input });
    for (const fee of input.fees ?? []) {
      if (!fee.id) {
        logger.debug("Skipping fee transaction as it doesn't have an id");
        continue;
      }
      await prisma.rWAGroupTransactionFee.update({
        where: {
          id_groupTransactionId_portfolioId: {
            id: fee.id,
            groupTransactionId: input.id,
            portfolioId: portfolio.id
          }
        },
        data: {
          ...fee,
          portfolioId: portfolio.id,
          groupTransactionId: input.id,
          id: fee.id
        }
      });
    }
  },
  REMOVE_FEES_FROM_GROUP_TRANSACTION: async (
    input: RemoveFeesFromGroupTransactionInput,
    portfolio: RWAPortfolio,
    prisma: Prisma.TransactionClient
  ) => {
    logger.debug({
      msg: 'Removing fee transaction from group transaction',
      input
    });
    for (const feeId of input.feeIds ?? []) {
      await prisma.rWAGroupTransactionFee.delete({
        where: {
          id_groupTransactionId_portfolioId: {
            id: feeId,
            groupTransactionId: input.id,
            portfolioId: portfolio.id
          }
        }
      });
    }
  },
  DELETE_GROUP_TRANSACTION: async (
    input: DeleteGroupTransactionInput,
    portfolio: RWAPortfolio,
    prisma: Prisma.TransactionClient
  ) => {
    logger.debug({ msg: 'Deleting group transaction', input });
    const { cashTransactionId, fixedIncomeTransactionId } =
      await prisma.rWAGroupTransaction.delete({
        where: {
          id_portfolioId: {
            id: input.id,
            portfolioId: portfolio.id
          }
        }
      });

    if (cashTransactionId) {
      await prisma.rWABaseTransaction.delete({
        where: {
          id_portfolioId: {
            id: cashTransactionId,
            portfolioId: portfolio.id
          }
        }
      });
    }

    if (fixedIncomeTransactionId) {
      await prisma.rWABaseTransaction.delete({
        where: {
          id_portfolioId: {
            id: fixedIncomeTransactionId,
            portfolioId: portfolio.id
          }
        }
      });
    }
  }
};

async function handleRwaDocumentStrand(
  strand: InternalTransmitterUpdate<RealWorldAssetsDocument, 'global'>,
  prisma: Prisma.TransactionClient
) {
  logger.debug(
    `Received strand for document ${strand.documentId} with operations: ${strand.operations.map(op => op.type).join(', ')}`
  );
  const portfolio = await prisma.rWAPortfolio.findFirst({
    where: {
      driveId: strand.driveId,
      documentId: strand.documentId
    }
  });

  if (portfolio === null) {
    logger.debug(
      `Skipping strand for document ${strand.documentId} as it doesn't exist in the read model`
    );
    return;
  }

  if (
    strandStartsFromOpZero(strand) ||
    !allOperationsAreSurgical(strand, surgicalOperations)
  ) {
    await rebuildRwaPortfolio(
      strand.driveId,
      strand.documentId,
      strand.state,
      prisma
    );
    return;
  }

  for (const operation of strand.operations) {
    await doSurgicalRwaPortfolioUpdate(operation, portfolio, prisma);
  }
}

async function doSurgicalRwaPortfolioUpdate(
  operation: OperationUpdate,
  portfolio: RWAPortfolio,
  prisma: Prisma.TransactionClient
) {
  logger.debug({
    msg: 'Doing surgical rwa portfolio update',
    name: operation.type
  });
  await surgicalOperations[operation.type](operation.input, portfolio, prisma);
}

function allOperationsAreSurgical(
  strand: InternalTransmitterUpdate<RealWorldAssetsDocument, 'global'>,
  surgicalOperations: Record<
    string,
    (
      input: any,
      portfolio: RWAPortfolio,
      prisma: Prisma.TransactionClient
    ) => void
  >
) {
  const allOperationsAreSurgical =
    strand.operations.filter(op => surgicalOperations[op.type] === undefined)
      .length === 0;
  logger.debug(`All operations are surgical: ${allOperationsAreSurgical}`);
  return allOperationsAreSurgical;
}
