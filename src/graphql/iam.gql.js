import gql from 'graphql-tag'

export const USERNAME_UPSERT = gql`
  mutation iamUpsertUsername($input: IamUpsertUsernameUpsert!){ 
    iamUpsertUsername(input: $input)
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

export const PRINCIPAL = gql`
  query principal {
    iam {
      principal {
        tenantId
        metadata
        tenant {
          integrations {
            id
            integration {
              id
              name
              key
              metadata
            }
            statusId
            priority
            metadata
          }
        }
        member {
          id
          statusId
          firstName
          lastName
          id
          birthdate
          tenantId
          name
          displayName
          mrn
          avatar {
            assetUrl
          }
          market {
            supportedCurrencyIds
          }
          tags {
            name
            id
          }
          customer {
            id
            subscriptions {
              id
              status
              metadata
            }
          }
          joinedOn
          slug
          contacts {
            id
            emails {
              id
              email
              priority
            }
            phones {
              id
              type
              number
              type
              priority
            }
            addresses {
              id
              name
              street
              street2
              city
              province
              postalCode
              country
              lat
              long
              priority
            }
          }
          integrations {
            id
            metadata
            priority
            integrationOid
            name
            key
          }
        }
      }
    }
  }
`
