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
          role
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
