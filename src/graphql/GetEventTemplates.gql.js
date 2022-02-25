import gql from 'graphql-tag'

export const GetEventTemplates = gql`
query GetEventTemplates {
  marketing {
    searchEventTemplates(input: {
      statusIn: [OPEN]
      tenantId: 1010
    }) {
      results {
        windows {
          duration
          id
          key
          name
          rewards {
            id
            key
            name
            settings
            type
            metadata
            requirements {
              key
              metadata
              settings
              type
            }
          }
        }
        id
        key
        name
        status
      }
    }
  }
}
`
