import gql from 'graphql-tag'

export const ORDERS_QUERY = gql`
query orderQuery($input: PurchaseSearchOrderInput!) {
  purchaseSearchOrders(input: $input) {
    id
    customerId
    total
  }
}
`
