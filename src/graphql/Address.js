import gql from 'graphql-tag'

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
    }
  }
`

export const ADDRESS_BY_MEMBER_ID = gql`
  query addressByMemberId($addressMemberId: MemberOrTenantInput!) {
    addressByMemberOrTenant(input: $addressMemberId) {
      id
      name
      street
      street2
      city
      province
      postalCode
      country
    }
  }
`
