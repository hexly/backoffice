import gql from 'graphql-tag'

export const SEARCH_SALES_QUERY = gql`
  query ordersQuery($input: PurchaseSearchOrderInput!){
    purchaseSearchOrders(input: $input) {
      id
      compStats
      total
      statusOid
      orderType
      checkedOutOn
      integrationOid
      customer {
        displayName
        email
      }
      currency
      lines {
        name
        id
        integrationOid
        itemPrice
        quantity
      }
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
  query searchSalesBySellerId ($input: PurchaseSearchOrderInput!){
    purchaseSearchOrders(input: $input) {
      id
      checkedOutOn
      statusOid
      lines {
        id
        orderId
        tenantIntegrationId
        integrationOid
        name
        itemPrice
        quantity
        typeId
        type
        metadata
      }
      integrationOid
      billingAddress {
        id
        city
        type
      }
      shippingAddress {
        id
        city
      }
      total
      compStats
      customerEmail
      metadata
      customer {
        id
        displayName
      }
    }
  }
`
