import { apolloClient } from '@/vue-apollo'
import LOGIN from '@/graphql/Login.gql'

export const UserActions = {
  LOGIN: 'login',
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
    jwt: null,
    loginError: null,
    principal: null
  },
  mutations: {
    [UserMutations.SET_JWT]: (state, jwt) => (state.jwt = jwt),
    [UserMutations.LOGIN_ERROR]: (state, err) => (state.loginError = err),
    [UserMutations.SET_PRINCIPAL]: (state, principal) => {
      state.principal = principal
    }
  },
  actions: {
    async [UserActions.LOGIN] ({ commit }, creds) {
      const { data } = await apolloClient.query({
        query: LOGIN,
        variables: { creds }
      })
      if (data.authenticate.success) {
        commit(UserMutations.SET_JWT, data.authenticate.token)
        commit(UserMutations.SET_PRINCIPAL, data.authenticate.principal)
      }
      return data.authenticate
    }
  },
  getters: {
    displayName: state => {
      return state.principal && state.principal.displayName
    }
  }
}
