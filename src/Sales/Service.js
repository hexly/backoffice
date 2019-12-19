import { apolloHexlyClient } from '@/vue-apollo'
import { GET_MEMBER_STATS } from './Api.js'

export const getMemberStats = async (input) => {
  const { saleStatsByDateRange } = await apolloHexlyClient.query({
    query: GET_MEMBER_STATS,
    variables: { input }
  })
  return saleStatsByDateRange
}
