import gql from 'graphql-tag'

export const DELETE_ADDRESS = gql`
  mutation removeAddress($addressInput: AddressInput!) {
    deleteAddress(input: $addressInput) {
      id
    }
  }
`

export const UPDATE_ADDRESS = gql`
  mutation ($input: AddressInput!) {
    membership {
      updateAddress(input: $input) {
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
        type
      }
    }
  }
`

export const CREATE_ADDRESS = gql`
  mutation ($input: AddressInput!) {
    membership {
      createAddress(input: $input) {
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
        type
      }
    }
  }
`

export const ADDRESS_BY_CONTACT_ID = gql`
  query addressByContactId($input: MembershipMemberSearchInput!){
    membership {
      search(input: $input) {
        results {
          id
          contacts {
            addresses {
              id
              name
              street
              street2
              city
              province
              postalCode
              country
              priority
              type
            }
          }
        }
      }
    }
  }
`
