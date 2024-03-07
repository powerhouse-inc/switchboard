import { Prisma } from "@prisma/client";
import { InternalTransmitterUpdate } from "document-drive";
import { ListenerFilter } from "document-model-libs/document-drive";
import { CashGroupTransactionType, RealWorldAssetsDocument, utils } from "document-model-libs/real-world-assets"
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


export async function transmit(strands: InternalTransmitterUpdate<RealWorldAssetsDocument, "global">[], prisma: Prisma.TransactionClient) {
  for (const strand of strands) {
    // TODO: come up with a better idea to check whether strandupdate is part of real world assets
    if (!strand.state.principalLenderAccountId) {
      continue;
    }

    //TODO: check whether all operations can be applied individually otherwise delete database and insert everything new
    let operationsCanbeAppliedIndividually = false;
    for (const operation of strand.operations) {
        // if undo/redo operation is present then delete database and insert everything new

    }

    // update entire state if operations can't be applied individually
    if (!operationsCanbeAppliedIndividually) {
      await updateEntireState(strand, prisma);
    }

    await analytics(prisma);
  }
}

async function updateEntireState(strand: InternalTransmitterUpdate<RealWorldAssetsDocument, "global">, prisma: Prisma.TransactionClient) {
  const { transactions, principalLenderAccountId, fixedIncomeTypes, spvs, accounts, feeTypes, portfolio } = strand.state;
  const driveId = strand.driveId;
  const documentId = strand.documentId;
  // create portfolio document
  await prisma.rWAPortfolio.upsert({
    where: {
      id_driveId: { id: documentId, driveId: driveId },
    },
    create: {
      id: documentId,
      driveId: driveId,
      principalLenderAccountId: principalLenderAccountId,
    },
    update: {
      principalLenderAccountId: principalLenderAccountId,
    },
  });

  // create spvs
  await prisma.rWAPortfolioSpv.createMany({
    data: spvs.map((spv) => ({ ...spv, driveId: driveId })),
    skipDuplicates: true,
  });

  // create feeTypes
  await prisma.rWAPortfolioServiceProvider.createMany({
    data: feeTypes.map((feeType) => ({ ...feeType, portfolioId: documentId, driveId: driveId })),
    skipDuplicates: true,
  });

  // fixed income types
  await prisma.rWAPortfolioFixedIncomeType.createMany({
    data: fixedIncomeTypes.map((fixedIncomeType) => ({ ...fixedIncomeType, driveId: driveId })),
    skipDuplicates: true,
  });

  // create accounts
  await prisma.rWAPortfolioAccount.createMany({
    data: accounts.map((account) => ({ ...account, portfolioId: documentId, driveId: driveId })),
    skipDuplicates: true,
  });

  // create RWAPortfolioAsset
  await prisma.rWAPortfolioAsset.createMany({
    data: portfolio.map((asset) => ({ ...asset, portfolioId: documentId, driveId: driveId, assetType: utils.isCashAsset(asset) ? "Cash" : "FixedIncome" })),
    skipDuplicates: true,
  });

  // create transactions
  // TODO: add transactions
  // for (const transaction of transactions) {
  //   const isCashTx = ["PrincipalDraw", "PrincipalReturn"].includes(transaction.type);

  //   // const cashTx = transaction as CashGroupTransactionType;
  //   const groupTxEntity = await prisma.rWAGroupTransaction.create({
  //     data: {
  //       id: transaction.id,
  //       driveId: driveId,
  //       portfolioId: documentId,
  //       type: transaction.type
  //     },
  //   })
  //   console.log(transaction)
  // }

  // add relationships
  await prisma.rWAPortfolioFixedIncomeTypeOnPortfolio.createMany({
    data: fixedIncomeTypes.map((fixedIncomeType) => ({
      fixedIncomeTypeId: fixedIncomeType.id,
      portfolioId: documentId,
      driveId: driveId,
    })),
    skipDuplicates: true,
  });

  await prisma.rWAPortfolioServiceProviderOnPortfolio.createMany({
    data: feeTypes.map((feeType) => ({ portfolioId: documentId, driveId: driveId, spvId: feeType.id })),
    skipDuplicates: true,
  });

  await prisma.rWAPortfolioSpvOnPortfolio.createMany({
    data: spvs.map((spv) => ({ portfolioId: documentId, driveId: driveId, spvId: spv.id })),
    skipDuplicates: true,
  });

  await prisma.rWAAccountOnPortfolio.createMany({
    data: accounts.map((account) => ({ portfolioId: documentId, driveId: driveId, accountId: account.id })),
    skipDuplicates: true,
  });
}

async function analytics(prisma: Prisma.TransactionClient) {
  // const data: Record<string, number> = {};
  // for (const asset of portfolioEntity!.portfolio) {
  //   const type = asset.fixedIncomeType?.name;
  //   if (!type || asset.purchasePrice === null) {
  //     continue;
  //   }
  //   if (!data[type]) {
  //     data[type] = 0;
  //   }

  //   data[type] = data[type] + asset.purchasePrice;
  // }

  // console.log(data);
}
