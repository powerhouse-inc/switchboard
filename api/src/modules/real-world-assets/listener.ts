import { Prisma } from "@prisma/client";
import { InternalTransmitterUpdate } from "document-drive";
import logger from "../../logger";
import { DocumentDriveDocument, DocumentDriveState, ListenerFilter } from "document-model-libs/document-drive";
import { RealWorldAssets } from "document-model-libs/document-models";


type RWA = typeof RealWorldAssets.Document
const updateOperationalData = async (prisma: Prisma.TransactionClient, data: any) => {

}

const updateAnalyticalData = async (prisma: Prisma.TransactionClient, data: any) => {

}

export async function transmit(strands: InternalTransmitterUpdate[], prisma: Prisma.TransactionClient) {


  for (const strand of strands) {

    const { transactions, principalLenderAccountId, fixedIncomeTypes, spvs, accounts, feeTypes, portfolio } = strand.state;
    const driveId = strand.driveId;
    const documentId = strand.documentId;

    // console.log(portfolio)

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



    // // create spvs
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
      data: portfolio.map((asset) => ({ ...asset, portfolioId: documentId, driveId: driveId, assetType: asset['currency'] ? "Cash" : "FixedIncome" })),
      skipDuplicates: true,
    });

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



    // fetch portfolio with everything
    const portfolioEntity = await prisma.rWAPortfolio.findUnique({
      where: {
        id_driveId: { id: documentId, driveId: driveId },
      },
      include: {
        accounts: true,
        portfolio: {
          include: {
            fixedIncomeType: true,
          },
        },
        fixedIncomeTypes: true,
        spvs: true,
        feeTypes: true,
      },
    });

    const data: Record<string, number> = {};
    for (const asset of portfolioEntity!.portfolio) {
      const type = asset.fixedIncomeType?.name;
      if (!type || asset.purchasePrice === null) {
        continue;
      }
      if (!data[type]) {
        data[type] = 0;
      }

      data[type] = data[type] + asset.purchasePrice;
    }

    console.log(data);
    // console.log(portfolioEntity.);
  }
}

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
    documentType: ["makerdao/rwa-portfolio"],
    scope: ["*"],
  },
  block: false,
  label: "real-world-assets",
}
