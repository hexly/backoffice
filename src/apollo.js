import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { setContext } from 'apollo-link-context'

function getAuth() {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('apollo-token')
  // return the headers to the context so httpLink can read them
  return token ? `Bearer ${token}` : ''
}

// Create the apollo client
export default function createApolloClient({
  ssr,
  base,
  endpoints,
  persisting
}) {
  let httpLink = new HttpLink({
    // You should use an absolute URL here
    uri: base + endpoints.graphql
  })

  // HTTP Auth header injection
  const authLink = setContext((_, { headers }) => ({
    headers: {
      ...headers,
      Authorization: getAuth()
    }
  }))

  // Concat all the http link parts
  const link = authLink.concat(httpLink)

  // Apollo cache
  const cache = new InMemoryCache()

  const apolloClient = new ApolloClient({
    link,
    cache,
    connectToDevTools: process.env.NODE_ENV !== 'production'
  })

  return apolloClient
}
