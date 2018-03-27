import { ApolloClient } from 'apollo-client'
import { split } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { createUploadLink } from 'apollo-upload-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { getMainDefinition } from 'apollo-utilities'
import { createPersistedQueryLink } from 'apollo-link-persisted-queries'
import { setContext } from 'apollo-link-context'

function getAuth () {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('apollo-token')
  // return the headers to the context so httpLink can read them
  return token ? `Bearer ${token}` : ''
}

// Create the apollo client
export default function createApolloClient ({ ssr, base, endpoints, persisting }) {
  let link

  let httpLink = new HttpLink({
    // You should use an absolute URL here
    uri: base + endpoints.graphql
  })

  // HTTP Auth header injection
  const authLink = setContext((_, { headers }) => ({
    headers: {
      ...headers,
      authorization: getAuth()
    }
  }))

  // Concat all the http link parts
  httpLink = authLink.concat(httpLink)
  if (persisting) {
    httpLink = createPersistedQueryLink().concat(httpLink)
  }

  // Apollo cache
  const cache = new InMemoryCache()

  if (!ssr) {
    // If on the client, recover the injected state
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-underscore-dangle
      const state = window.__APOLLO_STATE__
      if (state) {
        // If you have multiple clients, use `state.<client_id>`
        cache.restore(state.defaultClient)
      }
    }

    // File upload
    const uploadLink = authLink.concat(createUploadLink({
      uri: base + endpoints.graphql
    }))

    // using the ability to split links, you can send data to each link
    // depending on what kind of operation is being sent
    httpLink = split(
      operation => operation.getContext().upload,
      uploadLink,
      httpLink
    )

    link = split(
      // split based on operation type
      ({ query }) => {
        const { kind, operation } = getMainDefinition(query)
        return kind === 'OperationDefinition' &&
          operation === 'subscription'
      },
      httpLink
    )
  } else {
    // On the server, we don't want WebSockets
    link = httpLink
  }

  const apolloClient = new ApolloClient({
    link,
    cache,
    // Additional options
    ...(ssr ? {
      // Set this on the server to optimize queries when SSR
      ssrMode: true
    } : {
      // This will temporary disable query force-fetching
      ssrForceFetchDelay: 100,
      // Apollo devtools
      connectToDevTools: process.env.NODE_ENV !== 'production'
    })
  })

  apolloClient.$onLogin = token => {
    console.log('ON LOGIN', token)
    localStorage.setItem('apollo-token', token)
  }

  apolloClient.$onLogout = () => {
    console.log('ON LOGOUT')
    localStorage.removeItem('apollo-token')
    apolloClient.resetStore()
  }

  return apolloClient
}
