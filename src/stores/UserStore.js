import { apolloClient } from '@/vue-apollo'
import PRINCIPAL_QUERY from '@/graphql/Principal.gql'

export const UserActions = {
  LOGIN_SUCCESS: 'loginSuccess'
}

export const UserMutations = {
  SET_JWT: 'setJwt',
  AUTH_STATUS: 'authStatus',
  LOGIN_ERROR: 'setLoginError',
  SET_PRINCIPAL: 'setPrincipal'
}

export const UserStore = {
  state: {
    authorized: false,
    jwt: null,
    loginError: null,
    principal: null
  },
  mutations: {
    [UserMutations.SET_JWT]: (state, jwt) => (state.jwt = jwt),
    [UserMutations.AUTH_STATUS]: (state, status) => (state.authorized = status),
    [UserMutations.LOGIN_ERROR]: (state, err) => (state.loginError = err),
    [UserMutations.SET_PRINCIPAL]: (state, principal) =>
      (state.principal = principal)
  },
  actions: {
    [UserActions.LOGIN_SUCCESS]: async ({ commit }) => {
      commit(UserMutations.LOGIN_ERROR, null)
      const { data: { principal } } = await apolloClient.query({
        query: PRINCIPAL_QUERY
      })
      if (principal) {
        commit(UserMutations.AUTH_STATUS, true)
        commit(UserMutations.SET_PRINCIPAL, principal)
      } else {
        commit(
          UserMutations.LOGIN_ERROR,
          'You do not have permissions to access this app.'
        )
      }
    }
  },
  getters: {
    displayName: state => {
      return state.principal && state.principal.displayName
    }
  }
}
