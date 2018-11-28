import gql from 'graphql-tag'

const QUERY = gql`
  query Categories {
    ticketCategories(tenantId: 1004, integrationKey: "ryver") {
      id
      name
      description
    }
  }
`

export default () => {
  return {
    query: QUERY,
    update({ ticketCategories }) {
      return ticketCategories
    }
  }
}
