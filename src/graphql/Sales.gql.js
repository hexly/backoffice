import gql from 'graphql-tag'

export const SEARCH_SALES_QUERY = gql`
  query ordersQuery($input: PurchaseSearchOrderInput!){
    purchasing{
      orders(input: $input) {
        stats {
          guestPurchases
          registeredPurchases
          newCustomers
          returningCustomers
          totalCustomers
        }
        results {
          id
          compStats
          total
          statusOid
          orderType
          checkedOutOn
          integrationOid
          pii
          firstTimeCustomer
          guestCheckout
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
          shippingAddress {
            id
            street
            street2
            city
            province
            country
            postalCode
            priority
            type
          }
          tracking {
            trackingId
            dateShipped
            trackingNumber
            tracking_provider
            customTrackingLink
            customTrackingProvider
          }
        }
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
        street
        street2
        city
        province
        country
        postalCode
        priority
        type
      }
      shippingAddress {
        id
        street
        street2
        city
        province
        country
        postalCode
        priority
        type
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
