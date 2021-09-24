import gql from 'graphql-tag'

export const GET_MEMBER_ATTRIBUTE = gql`
  query getMemberAttribute($input: GetMemberAttributeInput!) {
    getMemberAttribute(input: $input) {
      key
      value
      memberId
      id
    }
  }
`

export const SET_MEMBER_ATTRIBUTE = gql`
  mutation upsertMemberAttribute($input: MemberAttributeInput!) {
    upsertMemberAttribute(input: $input) {
      key
      value
      memberId
      id
    }
  }
`

export const GET_MEMBER_ATTRIBUTES = gql`
query getMemberAttributes($input: MembershipMemberSearchInput!){
  membership {
    search (input: $input) {
      results {
        attributes{
          key
          value
          memberId
          id
        }
      }
    }
  }
}
`
