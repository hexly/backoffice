import Vue from 'vue'
import VueApollo from 'vue-apollo'
import { createHexlyApolloClient, createApolloClient } from './apollo'
const NETWORK_ERROR = 'Network error'

// Install the vue plugin
Vue.use(VueApollo)

// Config
const options = {
  ssr: false,
  base: process.env.VUE_APP_GRAPHQL_ENDPOINT || 'http://localhost:3000',
  endpoints: {
    graphql: process.env.VUE_APP_GRAPHQL_PATH || '/graphql',
    subscription: process.env.VUE_APP_GRAPHQL_SUBSCRIPTIONS_PATH || '/graphql'
  },
  persisting: false
}

// Create apollo client
export const apolloHexlyClient = createHexlyApolloClient(options)

const apolloProviderOptions = {
  defaultClient: apolloHexlyClient,
  clients: {
    hexly: apolloHexlyClient
  },
  errorHandler (err) {
    console.log('GraphQL error handler', err)
    if (err.message.toString().indexOf(NETWORK_ERROR) > -1) {
      // localStorage.clear()
      // window.location = '/'
    }
  }
}

if (process.env.VUE_APP_WP_GRAPHQL_ENDPOINT) {
  // Config
  const wpOptions = {
    ssr: false,
    base: process.env.VUE_APP_WP_GRAPHQL_ENDPOINT,
    endpoints: {
      graphql: process.env.VUE_APP_WP_GRAPHQL_PATH || '/graphql',
      subscription: process.env.VUE_APP_WP_GRAPHQL_SUBSCRIPTIONS_PATH || '/graphql'
    },
    persisting: false
  }

  apolloProviderOptions.clients.wordpress = createApolloClient(wpOptions)
}

if (process.env.VUE_APP_FEDERATED_GRAPHQL_ENDPOINT) {
  // Config
  const fedOptions = {
    ssr: false,
    base: process.env.VUE_APP_FEDERATED_GRAPHQL_ENDPOINT,
    endpoints: {
      graphql: process.env.VUE_APP_FEDERATED_GRAPHQL_PATH || '/graphql',
      subscription: process.env.VUE_APP_FEDERATED_GRAPHQL_SUBSCRIPTIONS_PATH || '/graphql'
    },
    persisting: false
  }

  apolloProviderOptions.clients.federated = createApolloClient(fedOptions, true)
}

// Create vue apollo provider
export const apolloProvider = new VueApollo(apolloProviderOptions)
