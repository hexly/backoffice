import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'

// Create the apollo client
export default function createApolloClient ({ ssr, base, endpoints, persisting }) {
  let link = new HttpLink({
    // You should use an absolute URL here
    uri: base + endpoints.graphql
  })

  // Apollo cache
  const cache = new InMemoryCache()

  const apolloClient = new ApolloClient({
    link,
    cache,
    connectToDevTools: process.env.NODE_ENV !== 'production'
  })

  return apolloClient
}
