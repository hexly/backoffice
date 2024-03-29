import gql from 'graphql-tag'

export const DELETE_ADDRESS = gql`
  mutation deleteAddress($input: DeleteAddressInput!){
    membership {
      deleteAddress (input: $input ) {
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

export const ADDRESS_BY_MEMBER_SEARCH = gql`
  query addressByMemberSearch($input: MembershipMemberSearchInput!){
    membership {
      search (input: $input) {
        results {
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
              type
              priority
            }
          }
        }
      }
    }
  }
`
