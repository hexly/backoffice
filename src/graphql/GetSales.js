import gql from 'graphql-tag'

const SALES_QUERY = gql`
  query SalesBySeller($saleCondition: SaleCondition!) {
    allSales(condition: $saleCondition) {
      nodes {
        totalAmount
        totalPoints
        commissionableAmount
        commissionablePoints
        day
        month
        year
      }
    }
  }
`

export default variables => {
  return {
    query: SALES_QUERY,
    variables: {
      saleCondition: {
        ...variables
      }
    },
    update({ allSales }) {
      return allSales.nodes
    }
  }
}
