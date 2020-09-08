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

export const MEMBER_INTEGRATION_COMMAND = gql`
  mutation MemberIntegrationCommand($input: TenantIntegrationCommandInput!) {
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

export const UPSERT_MEMBER_TENANT_INTEGRATION = gql`
  mutation upsertMemberTenantIntegration($input: UpsertMemberTenantIntegrationsInput!) {
    upsertMemberTenantIntegrations(input: $input) {
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

export const GET_MEMBER_TENANT_INTEGRATIONS = gql`
  query principal {
    getPrincipal {
      member {
        tenantIntegrations {
          id
          tenantIntegrationId
          integrationOid
          integrationStatusId
          metadata
          priority
          name
          key
        }
      }
    }
  }
`
