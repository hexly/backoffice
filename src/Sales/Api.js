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
        mode
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

export const SALES_BY_PRODUCT_QUERY = gql`
  query salesByProduct($input: ProductVariantSalesInput!) {
    salesByProductVariant(input: $input) {
      relativeDepth
      itemName
      productOid
      variantOid
      quantity
      subtotal
      awardedOn
    }
  }
`
