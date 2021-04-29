import gql from 'graphql-tag'

export const ORDERS_QUERY = gql`
query orderQuery($input: PurchaseSearchOrderInput!) {
  purchaseSearchOrders(input: $input) {
    id
    total
    orderType
    integrationOid
    customerName
    productName
    productType
    checkedOutOn
    metadata
    itemPrice
    customer {
      email
    }
  }
}
`
