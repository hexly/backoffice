import gql from 'graphql-tag'

export const MEMBER_STATS_BY_DEPTH = gql`
  query teamDataByDepth($input: getTeamDataByDepthInput!){ 
    getTeamDataByDepth(input: $input) {
      id
      lineage
      name
      firstName
      lastName
      displayName
      mrn
      profileUrl
      createdOn
      joinedOn
      claimedOn
      slugs
      counts
      emails
    }
  }
`

export const MEMBER_STATS_BY_DEPTH_FEDERATED = gql`
  query teamDataByDepth($input: getTeamDataByDepthInput!) {
    membership {
      getTeamDataByDepth(input: $input) {
        id
        lineage
        name
        firstName
        lastName
        displayName
        mrn
        profileUrl
        createdOn
        joinedOn
        claimedOn
        slugs
        counts
        emails
      }
    }
  }
`

export const MEMBER_TOTAL_COUNT = gql`
  query memberCount($input: CountInput!){ 
    memberCount(input: $input) {
      count
      type
    }
  }
`
export const MAX_MRN = gql`
  query getMaxMrn($input: MrnForTenantInput){
    memberGetMaxMrnForTenant(input: $input)
  }
`

export const MAX_MRN_FEDERATED = gql`
  query getMaxMrn($input: MrnForTenantInput) {
    membership {
      memberGetMaxMrnForTenant(input: $input) 
    }
  }
`
export const TEAM_RECRUITS_BY_DATE = gql`
  query Stats($input:CommerceStatsRangedTeamStatsSearchInput!) {
  commerceStatsRangedTeamStatsSearch(input:$input){
    stats{
      contributors {
        name
        relativeDepth
        recruited
      }
    }
  }
}
`

export const TEAM_SIZE_BY_GENERATION = gql`
  query teamSizes($input:MembershipTeamSizesInput!) {
    membershipTeamSizes(input:$input){
      count
      generation
  }
}
`

export const MONTHLY_STATS_QUERY = gql`
  query getMonthlyStats(
    $targetCondition: MemberMonthlyStatCondition!
    $firstLevelCondition: MemberMonthlyStatCondition!
  ) {
    targetStats: allMemberMonthlyStats(condition: $targetCondition) {
      nodes {
        tenantId
        year
        month
        joinedOn
        sellerId
        sellerPath
        teamSize
        firstLevelSize
        secondLevelSize
        thirdLevelSize
        fourthLevelSize
        fifthLevelSize
        totalAmount
        totalTeamAmount
        totalPoints
        commissionableAmount
        commissionablePoints
        name
        sponsorId
      }
    }
    firstLevelStats: allMemberMonthlyStats(condition: $firstLevelCondition) {
      nodes {
        tenantId
        year
        month
        name
        joinedOn
        sellerId
        sellerPath
        teamSize
        firstLevelSize
        secondLevelSize
        thirdLevelSize
        fourthLevelSize
        fifthLevelSize
        totalAmount
        totalTeamAmount
        totalPoints
        commissionableAmount
        commissionablePoints
        sponsorId
      }
    }
  }
`

export const MONTHLY_STATS_QUERY_FEDERATED = gql`
  query getMonthlyStats($input: EngineStatsPeriodsByMemberInput) {
    comp {
      engineStatsPeriodsByMemberId(input: $input) {
        id
      }
    }
  }
`
