import gql from 'graphql-tag'

export const ORDERS_QUERY_FEDERATED = gql`
  query ordersQuery($input: PurchaseSearchOrderInput!){
    purchasing {
        orders(input: $input) {
          results{
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
  }
`
