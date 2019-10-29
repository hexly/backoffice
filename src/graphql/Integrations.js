import gql from 'graphql-tag'

export const CREATE_MEMBER_INTEGRATION = gql`
  mutation createMemberIntegration($input: TenantIntegrationCommandInput!) {
    integrationCommand(input: $input) {
      id
      tenantIntegrationId
      integrationOid
      integrationStatusId
      metadata
      priority
      key
      name
    }
  }
`
