import gql from 'graphql-tag'

export const CHECK_IF_UNIQUE_SLUG = gql`
query Slugs($input: SlugInput!) {
  checkSlug(input: $input) {
    id
  }
}
`
export const ADD_MEMBER_SLUG = gql`
mutation AddSlug($input: SlugInput!) {
  addMemberSlug(input: $input) {
    id,
    slug
  }
}
`
