import { ApolloClient } from 'apollo-client'
import { BatchHttpLink } from 'apollo-link-batch-http'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { setContext } from 'apollo-link-context'
import { get } from 'lodash'
import store from '@/store'

import tenantInfo from '@/tenant.js'
const mf = require('./build.info.json')

function getAuth () {
  // get the authentication token from local storage if it exists
  const token = store.state.user.jwt
  // return the headers to the context so httpLink can read them
  return token ? `Bearer ${token}` : undefined
}

// Create the apollo client
export default function createApolloClient ({
  ssr,
  base,
  endpoints,
  persisting
}) {
  const batchLink = new BatchHttpLink({
    // You should use an absolute URL here
    uri: base + endpoints.graphql,
    // fetch: customFetch
    batchMax: 5
  })

  const httpLink = new HttpLink({ uri: base + endpoints.graphql })

  // HTTP Auth header injection
  const authLink = setContext((_, { headers = {} }) => {
    const context = {
      headers: {
        ...headers
      }
    }
    const memberId = get(store, 'state.user.principal.memberId')
    if (memberId) {
      context.headers['x-hexly-member-id'] = memberId
    }
    const authToken = getAuth()
    if (authToken && authToken.trim().length > 0) {
      context.headers.Authorization = authToken
    } else {
      delete context.headers.Authorization
    }
    return context
  })

  // Concat all the http link parts
  const dontBatch = [
    'teamStatsByLevel',
    'principal'
  ]
  const link = authLink.split(
    (operation) => dontBatch.indexOf(operation.operationName) === -1,
    batchLink,
    httpLink
  )

  // Apollo cache
  const cache = new InMemoryCache({
    addTypename: false
  })

  const apolloClient = new ApolloClient({
    link,
    cache,
    connectToDevTools: process.env.NODE_ENV !== 'production',
    name: tenantInfo.name,
    version: mf.buildTime
  })

  return apolloClient
}
