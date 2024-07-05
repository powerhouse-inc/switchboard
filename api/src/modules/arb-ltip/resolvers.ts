import { objectType, enumType, scalarType } from 'nexus';
import { GQLDateBase } from '../system';
import { documentModelInterface } from '../document';

export const ArbLtipGranteeState = objectType({
  name: "ArbLtipGranteeState",
  definition(t) {
    t.nonNull.id("id")
    t.string("granteeName")
    t.float("grantSize")
    t.float("matchingGrantSize")
    t.string("grantSummary")
    t.string("fundingAddress")
    t.list.field("fundingType", { type: FundingType })
    t.string("disbursementContractAddress")
    t.string("metricsDashboardLink")
    t.list.field("phases", { type: Phase })
  }
})

export const ArbStipGranteeState = objectType({
  name: "ArbStipGranteeState",
  definition(t) {
    t.nonNull.id("id")
    t.string("granteeName")
    t.float("grantSize")
    t.float("matchingGrantSize")
    t.string("grantSummary")
    t.string("fundingAddress")
    t.list.field("fundingType", { type: FundingType })
    t.string("disbursementContractAddress")
    t.string("metricsDashboardLink")
    t.list.field("phases", { type: Phase })
  }
})

export const Contract = objectType({
  name: "Contract",
  definition(t) {
    t.nonNull.id("contractId")
    t.string("contractLabel")
    t.string("contractAddress")
  }
})
export const GranteeActuals = objectType({
  name: "GranteeActuals",
  definition(t) {
    t.float("arbReceived")
    t.float("arbUtilized")
    t.float("arbRemaining")
    t.list.field("contractsIncentivized", { type: Contract })
    t.string("summary")
    t.string("disclosures")
  }
})
export const GranteePlanned = objectType({
  name: "GranteePlanned",
  definition(t) {
    t.float("arbToBeDistributed")
    t.list.field("contractsIncentivized", { type: Contract })
    t.list.field("distributionMechanism", { type: DistributionMechanism })
    t.string("summary")
    t.string("summaryOfChanges")
  }
})
export const GranteeStats = objectType({
  name: "GranteeStats",
  definition(t) {
    t.float("avgDailyTVL")
    t.float("avgDailyTXNS")
    t.float("avgDailyVolume")
    t.float("uniqueAddressesCount")
    t.float("transactionFees")
  }
})
export const Phase = objectType({
  name: "Phase",
  definition(t) {
    t.nonNull.field("startDate", { type: GQLDateBase })
    t.nonNull.field("endDate", { type: GQLDateBase })
    t.field("actuals", { type: GranteeActuals })
    t.field("planned", { type: GranteePlanned })
    t.field("stats", { type: GranteeStats })
    t.field("status", { type: Status })
  }
})

export const DistributionMechanism = enumType({
  name: "DistributionMechanism",
  members: ['LPIncentives','Airdrop'],
});
export const FundingType = enumType({
  name: "FundingType",
  members: ['EOA','Multisig','TwoofThreeMultisig','ThreeofFiveMultisig'],
});
export const Status = enumType({
  name: "Status",
  members: ['Uninitialized','NotStarted','InProgress','Finalized'],
});

export const ArbLtipGranteeDocument = objectType({
  name: 'ArbLtipGrantee',
  definition(t) {
    t.implements(documentModelInterface);
    t.nonNull.field('state', { type: ArbLtipGranteeState });
  },
});
