import gql from 'graphql-tag'

export const CREATE_MEMBER_INTEGRATION = gql`
  mutation createMemberIntegration($input: CommandInput!) {
    integrationCommand(input: $input) {
      id
      tenantIntegrationId
      integrationOid
      integrationStatusId
      metadata
      priority
    }
  }
`
