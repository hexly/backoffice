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
    productType
    checkedOutOn
    metadata
    itemPrice
  }
}
`
