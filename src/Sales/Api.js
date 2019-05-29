import gql from 'graphql-tag'

export const GET_MEMBER_STATS = gql`
  query saleStatsByDateRangeQuery($input: SaleStatsOverDateRangeFilter) {
    saleStatsByDateRange(input: $input) {
      memberId
      rangeStart
      rangeEnd
      joinedOn
      displayName
      profileUrl
      depth
      sponsorId
      teamSize
      frontLineSize
      stats {
        saleCount
        totalPoints
        totalAmount
        commissionablePoints
        commissionableAmount
        month
        year
      }
    }
  }
`
