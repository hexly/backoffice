import gql from 'graphql-tag'

export const COMP_PAYOUTS_QUERY = gql`
query compRecentEarnings {
  compRecentEarnings{
    earnings {
      reason
      payout
      payeeMarket
      
      sellerId
      seller
      
      integrationOid
      tenantIntegrationId
      awardedDate

      base
      modifier
      peg
      vat
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
