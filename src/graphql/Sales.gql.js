import gql from 'graphql-tag'

export const SEARCH_SALES_QUERY = gql`
  query searchSalesBySellerId($saleSearchInput: SaleSearchInput!) {
    searchSalesBySellerId(input: $saleSearchInput) {
      saleId
      providerId
      providerOid
      totalPoints
      totalAmount
      commissionableAmount
      commissionablePoints
      firstName
      displayName
      awardedDate
      sellerEmail
      customer
      orderId
      total
      discountTotal
      taxTotal
      shippingTotal
      currency
      status
      customerNote
      shippingTotal
      lineItems
      shippingCity
      shippingState
      shippingCountry
      shippingZip
      shippingAddress1
      shippingAddress2
      shippingFirstName
      shippingLastName
      billingCity
      billingState
      billingCountry
      billingZip
      billingAddress1
      billingAddress2
      billingFirstName
      billingLastName
      billingEmail
      metadata
    }
  }
`

export const SALES_STATS = gql`
  query SalesStats($input: SaleStatsOverDateRangeFilter) {
    saleStatsByDateRange(input: $input) {
      memberId
      displayName
      profileUrl
      depth
      sponsorId
      teamSize
      frontLineSize
      mode
      rangeStart
      rangeEnd
      stats {
        saleCount
        totalPoints
        totalAmount
        commissionablePoints
        commissionableAmount
        year
        month
        mode
      }
    }
  }
`

export const SEARCH_SALES_SELLER_ID = gql`
  query searchSalesBySellerId($saleSearchInput: SaleSearchInput!) {
    searchSalesBySellerId(input: $saleSearchInput) {
      saleId
      providerId
      providerOid
      totalPoints
      totalAmount
      commissionableAmount
      commissionablePoints
      firstName
      displayName
      awardedDate
      sellerEmail
      customer
      orderId
      total
      status
      customerNote
      shippingTotal
      lineItems
      shippingCity
      shippingState
      shippingCountry
      shippingZip
      shippingAddress1
      shippingAddress2
      shippingFirstName
      shippingLastName
      billingCity
      billingState
      billingCountry
      billingZip
      billingAddress1
      billingAddress2
      billingFirstName
      billingLastName
      __typename
    }
  }
`
