import gql from 'graphql-tag'

export const GET_RECENT_POST = gql`
  query getPosts($first: Int, $where: RootQueryToPostConnectionWhereArgs) {
    posts(first: $first, where: $where) {
      edges {
        node {
          title
          date
          content(format:RENDERED)
        }
      }
    }
  }
`
