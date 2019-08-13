import gql from 'graphql-tag'

export const CREATE_MEMBER_INTEGRATION = gql`
  query createMemberIntegration($input: CommandInput!) {
    integrationCommand(input: $input) {
      name
      contactEmail
      total
      profileUrl
      joinedOn
    }
  }
`
