import { apolloClient } from '@/vue-apollo'
import PRINCIPAL_QUERY from '@/graphql/Principal.gql'

export default {
  state: {
    authorized: false,
    jwt: null,
    loginError: null
  },
  mutations: {
    setJwt: (state, jwt) => {
      state.jwt = jwt
    },
    userAuthed: state => {
      state.authorized = true
    },
    setLoginError: (state, err) => {
      state.loginError = err
    }
  },
  actions: {
    loginSuccess: async ({ commit }) => {
      const { data: { principal } } = await apolloClient.query({
        query: PRINCIPAL_QUERY
      })
      if (principal.permissions.length >= 1) {
        commit('userAuthed')
      } else {
        commit(
          'setLoginError',
          'You do not have permissions to access this app.'
        )
      }
    }
  },
  getters: {}
}
