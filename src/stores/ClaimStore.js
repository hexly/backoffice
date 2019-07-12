import { apolloClient } from '@/vue-apollo'

import {
  CONSUME_TOKEN,
  GENERATE_TOKEN,
  RESET_TOKEN,
  VALIDATE_TOKEN
} from '@/graphql/Authentication.js'

export const ClaimActions = {
  GET_TOKEN: 'getToken',
  CREATE_ACCOUNT: 'consumeToken',
  RESET_PASSWORD: 'resetPassword',
  CLAIM: 'claim',
  RESET: 'reset'
}

export const ClaimStore = {
  state: {},
  mutations: {},
  actions: {
    [ClaimActions.GET_TOKEN]: ({ commit }, token) => {
      return apolloClient.query({
        query: VALIDATE_TOKEN,
        fetchPolicy: 'network-only',
        variables: { token }
      })
    },
    [ClaimActions.CREATE_ACCOUNT]: ({ commit }, input) => {
      return apolloClient.mutate({
        mutation: CONSUME_TOKEN,
        variables: { input }
      })
    },
    [ClaimActions.RESET_PASSWORD]: ({ commit }, input) => {
      return apolloClient.mutate({
        mutation: RESET_TOKEN,
        variables: { input }
      })
    },
    [ClaimActions.CLAIM]: async ({ commit }, input) => {
      return apolloClient.mutate({
        mutation: GENERATE_TOKEN,
        variables: { input }
      })
    },
    [ClaimActions.RESET]: ({ commit }, input) => {
      return apolloClient.mutate({
        mutation: GENERATE_TOKEN,
        variables: { input }
      })
    }
  },
  getters: {}
}
