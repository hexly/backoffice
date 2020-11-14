import gql from 'graphql-tag'

export const SEARCH_PAYOUTS = gql`
query SearchPayouts($input: SearchPayoutsInput!){
  payouts{
    search(input: $input){
      totalResults
      page
      pageSize
      results {
        id
        status
        currency
        amount
        note
        params
        metadata
        holdUntil
        issuedOn
        releasedOn
        acceptedOn
        integrationName
        deductions {
          id
          amount
          type
          issuedOn
          note
        }
      }
    }
  }
}
`

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

export const PAYOUTS_SUMMARY = gql`
query payoutsSummary($input: PayoutsSummaryInput!){
  payouts{
    summary(input: $input){
      reason
      rate
      ledgerMemberId
      currency
      amountPaid
      amountEarned
    }
  }
}
`
