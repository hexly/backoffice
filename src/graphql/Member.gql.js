import gql from 'graphql-tag'

export const ADJUST_TAGS = gql`
  mutation adjustMemberTags($input: MemberTagAdjustmentInput!){ 
    adjustTags(input: $input){
      tags
    }
  }
`

export const GET_MEMBER_PAYOUTS = gql`
  query payoutsThroughPrincipal {
    getPrincipal {
      member{
        id
        payouts {
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
        }
      }
    }
  }
`
