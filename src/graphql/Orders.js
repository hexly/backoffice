import gql from 'graphql-tag'

export const ORDERS_QUERY = gql`
query orderQuery($input: PurchaseSearchOrderInput!) {
  purchasing{
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
}
`

export const ORDERS_QUERY_FEDERATED = gql`
  query ordersQuery($input: PurchaseSearchOrderInput!){
    purchasing {
      purchaseSearchOrders(input: $input) {
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
          id
          integrationOid
          name
          itemPrice
        }
      }
    }
  }
`
