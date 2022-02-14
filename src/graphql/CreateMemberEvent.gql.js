import gql from 'graphql-tag'

export const CreateMemberEvent = gql`
  mutation CreateMemberEvent($input: MarketingMemberEventInput!) {
    marketing {
      memberEvent(input: $input) {
        id
        participants {
          name
          id
          memberId
        }
        template {
          id
          name
          status
        }
      }
    }
  }
`
