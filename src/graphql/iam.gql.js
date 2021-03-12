import gql from 'graphql-tag'

export const USERNAME_UPSERT = gql`
  mutation iamUpsertUsername($input: IamUpsertUsernameUpsert!){ 
    iamUpsertUsername(input: $input)
  }
`

export const FEDERATED_LOGIN = gql`
  mutation login ($input: Credentials!) {
    iam {
      login(input: $input) {
        success
        message
        metadata
      }
    }
  }
`

export const FEDERATED_GET_PRINCIPAL = gql`
  mutation login {
    iam {
      principal {
        type
      }
    }
  }
`

export const LOGIN = gql`
  mutation auth($creds: Credentials!) {
    login(input: $creds) {
      token
      success
      reason
      issued
      principal {
        username
        identityId
        memberId
        member {
          firstName
          lastName
          id
          birthdate
          tenantId
          name
          displayName
          mrn
          slug
          slugs(priority: 0) {
            slug
          }
          sponsor {
            displayName
            profileUrl
            contacts {
              id
              emails {
                id
                email
              }
            }
          }
          joinedOn
          tags
          contacts {
            id
            emails {
              id
              email
            }
            phoneNumbers {
              id
              number
            }
          }
          profileUrl
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
          customer {
            subscriptions {
              metadata
              status
            }
          }
        }
      }
    }
  }
`

export const GET_PRINCIPAL = gql`
  query principal {
    getPrincipal {
      role
      displayName
      username
      identityId
      tenantId
      memberId
      permissions
      member {
        market {
          supportedCurrencyIds
        }
        statusId
        firstName
        lastName
        id
        birthdate
        tenantId
        name
        displayName
        mrn
        slug
        slugs(priority: 0) {
          slug
        }
        sponsor {
          displayName
          profileUrl
          contacts {
            id
            emails {
              id
              email
            }
          }
        }
        joinedOn
        tags
        contacts {
          id
          emails {
            id
            email
          }
          phoneNumbers {
            id
            number
          }
        }
        profileUrl
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
        customer {
          subscriptions {
            metadata
            status
          }
        }
      }
      tenant {
        id
        baseUrl
        name
        slug
        integrations {
          id
          priority
          metadata
          statusId
          name
          key
          integrationMetadata
        }
      }
    }
  }
`
