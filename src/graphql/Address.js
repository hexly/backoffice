import gql from 'graphql-tag'

export const DELETE_ADDRESS = gql`
  mutation removeAddress($addressInput: AddressInput!) {
    deleteAddress(input: $addressInput) {
      id
    }
  }
`

export const UPDATE_ADDRESS = gql`
  mutation updateAddress($addressInput: AddressInput!) {
    updateAddress(input: $addressInput) {
      id
      name
      street
      street2
      city
      province
      postalCode
      country
      type
      priority
    }
  }
`

export const ADDRESS_BY_CONTACT_ID = gql`
  query addressByContactId($addressContactId: ContactOrTenantInput!) {
    addressByContactOrTenant(input: $addressContactId) {
      id
      name
      street
      street2
      city
      province
      postalCode
      country
      type
      priority
    }
  }
`
