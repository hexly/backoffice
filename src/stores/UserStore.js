import { apolloClient } from '@/vue-apollo'
import LOGIN from '@/graphql/Login.gql'
import _ from 'lodash'

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
    async [UserActions.LOGIN]({ commit }, creds) {
      const response = await apolloClient.mutate({
        mutation: LOGIN,
        variables: { creds },
        fetchPolicy: 'no-cache'
      })
      const { success, token, principal, reason } = _.get(
        response,
        'data.login',
        {}
      )
      if (success) {
        principal.displayName = _.get(
          principal,
          'member.displayName',
          '<Unknown Name>'
        )
        commit(UserMutations.SET_JWT, token)
        commit(UserMutations.SET_PRINCIPAL, principal)
      }
      return { success, token, principal, reason }
    }
  },
  getters: {
    displayName: state => {
      return state.principal && state.principal.displayName
    }
  }
}
