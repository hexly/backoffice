import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { setContext } from 'apollo-link-context'
import store from '@/store'

function getAuth() {
  // get the authentication token from local storage if it exists
  const token = store.state.user.jwt
  // return the headers to the context so httpLink can read them
  return token ? `Bearer ${token}` : undefined
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
  const authLink = setContext((_, { headers }) => {
    Object.keys(headers)
      .filter(p => p.toLowerCase() === 'content-type')
      .forEach(p => {
        delete headers[p]
      })
    const context = {
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    }
    const authToken = getAuth()
    if (authToken) {
      context.headers.Authorization = authToken
    }
    return context
  })

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
