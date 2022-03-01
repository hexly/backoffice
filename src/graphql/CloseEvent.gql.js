import gql from 'graphql-tag'

export const CloseEvent = gql`
  mutation CloseEvent($input: MarketingMemberEventOpsInput!, $setStatusInput: MarketingMemberEventStatusInput!) {
    marketing {
      event(input: $input){
        setStatus(input: $setStatusInput){
          message
          metadata
        }
      }
    }
  }
`
