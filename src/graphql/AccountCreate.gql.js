import gql from 'graphql-tag'

export const CREATE = gql`
  mutation createMember($input: MembershipCreateInput!){
    membership {
      create (input: $input ) {
        id
        name
        displayName
      }
    }
  }
`
