import gql from 'graphql-tag'

export const ORDERS_QUERY = gql`
query orderQuery($input: PurchaseSearchOrderInput!) {
  purchaseSearchOrders(input: $input) {
    id
    total
    orderType
    integrationOid
    customerName
    customerEmail
    productName
    checkedOutOn
    itemPrice
    currency
  }
}
`

export const ORDERS_QUERY_FEDERATED = gql`
  query ordersQuery($input: PurchaseSearchOrderInput!){
    purchasing {
      orders(input: $input) {
        results {
          id
          total
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
            itemPrice
          }
        }
      }
    }
  }
`
