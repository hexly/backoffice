import gql from 'graphql-tag'

export const COMP_PAYOUTS_QUERY = gql`
query compRecentEarnings($input: CompRecentEarningsInput) {
  compRecentEarnings(input: $input){
    results {
      issuedOn
      amount
      note
      currency
      metadata
    }
  }
}
`

export const ENGINE_STATS_QUERY = gql`
  query engineStats($input: EngineStatsInput) {
    engineStatsByMemberIds(input: $input) {
      memberId
      periodId
      refreshedOn
      uplineIds
      sponsorId
      qualified
      current
      next
      levelCounts
      groupCount
      downlineCount
      ranks
      qualifiedLegCount
      payouts
    }
  }
`

export const ENGINE_STATS_PERIODS_QUERY = gql`
  query engineStatsPeriod($input: EnginePeriodSearchInput!, $inputRankings: EnginePeriodRankingsInput!) {
    engine {
      periods(input: $input) {
        results {
          id
          name
          key
          open
          close
          hasPayroll
          metadata
          status
          rankings(input: $inputRankings) {
            page
            pageSize
            results {
              sponsor {
                id
                displayName
                avatar {
                  assetUrl
                }
                contacts {
                  emails {
                    email
                  }
                }
              }
            }
            totalResults
            totalPages
          }
        }
      }
    }
  }
`

export const COMP_STATS_QUERY = gql`
  query compStatsQuery($input: CompStatsQueryInput) {
    compStatsQuery(input: $input) {
      results {
        memberId
        rank {
          rank
          achieved
          satisfied {
            activeLeg
            genOption1Rank
            genOption1Value
            genOption2Rank
            genOption2Value
            personalTotalPoints
            lifetimeTotalPoints
            groupPoints
            downlinePoints
            downlineAdjustedPoints
          }
          deltas {
            activeLeg
            genOption1Rank
            genOption1Value
            genOption2Rank
            genOption2Value
            personalTotalPoints
            lifetimeTotalPoints
            groupPoints
            downlinePoints
            downlineAdjustedPoints
          }
          requirements {
            activeLeg
            genOption1Rank
            genOption1Value
            genOption2Rank
            genOption2Value
            personalTotalPoints
            lifetimeTotalPoints
            groupPoints
            downlinePoints
            downlineAdjustedPoints
          }
        }
        nextRank {
          rank
          achieved
          satisfied {
            activeLeg
            genOption1Rank
            genOption1Value
            genOption2Rank
            genOption2Value
            personalTotalPoints
            lifetimeTotalPoints
            groupPoints
            downlinePoints
            downlineAdjustedPoints
          }
          deltas {
            activeLeg
            genOption1Rank
            genOption1Value
            genOption2Rank
            genOption2Value
            personalTotalPoints
            lifetimeTotalPoints
            groupPoints
            downlinePoints
            downlineAdjustedPoints
          }
          requirements {
            activeLeg
            genOption1Rank
            genOption1Value
            genOption2Rank
            genOption2Value
            personalTotalPoints
            lifetimeTotalPoints
            groupPoints
            downlinePoints
            downlineAdjustedPoints
          }
        }
      }
    }
  }
`

export const ENGINE_TEAM_ACTIVITY = gql`
  query engineStatsTeamActivity($input: EngineStatsActivityInput!) {
    engineStatsGetTeamActivity(input: $input) {
      page
      totalPages
      pageSize
      totalResults
      results {
        id
        name
        mrn
        depth
        memberPath
        qualified
        rank
        psv
        cpsv
        gsv
        dsv
        legs
        current
        next
        groupCount
        downlineCount
        member {
          profileUrl
          contacts {
            emails {
              email
            }
          }
        }
        ancestors {
          profileUrl
          displayName
        }
      }
    }
  }
`

export const ENGINE_DASHBOARD_PROMOS = gql`
query engineStatsMemberPromotionStatus($input: EngineStatsMemberPromotionStatusInput!){
  engineStatsMemberPromotionStatus(input: $input){
    metadata
  }
}
`

export const ENGINE_DASHBOARD_BANNERS = gql`
query banners($input: EngineStatsMemberBannersInput!){
  banners: engineStatsMemberBanners(input: $input){
    results {
      id
      name
      key
      tenantIntegrationId
      description
      metadata
      startDate
      endDate
      results
    }
  }
}
`
