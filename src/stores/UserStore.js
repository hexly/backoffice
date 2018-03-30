import { apolloClient } from '@/vue-apollo'
import PRINCIPAL_QUERY from '@/graphql/Principal.gql'

export const UserActions = {
  LOGIN_SUCCESS: 'loginSuccess'
}

export const UserMutations = {
  SET_JWT: 'setJwt',
  AUTH_STATUS: 'authStatus',
  LOGIN_ERROR: 'setLoginError',
  INIT: 'storeInt'
}

export const UserStore = {
  state: {
    authorized: false,
    jwt: null,
    loginError: null
  },
  mutations: {
    [UserMutations.SET_JWT]: (state, jwt) => (state.jwt = jwt),
    [UserMutations.AUTH_STATUS]: (state, status) => (state.authorized = status),
    [UserMutations.LOGIN_ERROR]: (state, err) => (state.loginError = err)
  },
  actions: {
    [UserActions.LOGIN_SUCCESS]: async ({ commit }) => {
      const { data: { principal } } = await apolloClient.query({
        query: PRINCIPAL_QUERY
      })
      if (principal.permissions.length >= 1) {
        commit(UserMutations.AUTH_STATUS, true)
      } else {
        commit(
          UserMutations.LOGIN_ERROR,
          'You do not have permissions to access this app.'
        )
      }
    }
  },
  getters: {}
}
