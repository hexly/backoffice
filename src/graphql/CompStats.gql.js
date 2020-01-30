import gql from 'graphql-tag'

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
