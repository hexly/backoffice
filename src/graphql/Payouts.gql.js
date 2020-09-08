import gql from 'graphql-tag'

export const GET_PAYOUTS_GROUPED = gql`
query PayoutsGrouped($input: groupedByStatusInput!){
  payouts{
    groupedByStatus(input: $input){
      total
      name
      key
      currency
      statusId
      payoutIds
    }
  }
}
`

export const ATTEMPT_PAYOUTS_GROUPED = gql`
mutation AttemptPayoutsGrouped($input: groupedByStatusInput!){
  payouts{
    groupedByStatus(input: $input){
      total
      name
      key
      statusId
      payoutIds
    }
  }
}
`
