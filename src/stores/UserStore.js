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
  SET_PRINCIPAL: 'setPrincipal',
  TOGGLE_IMPERSONATION: 'toggleImpersonation',
  SET_PROFILE: 'setProfilePic',
  ADD_INTEGRATION: 'addTenantIntegration',
  SET_SLUG: 'user:setSlug'
}

const parseLegacyPrincipal = (principal) => {
  const updated = {
    ...principal
  }
  updated.displayName = _.get(
    principal,
    'member.displayName',
    '<Unknown Name>'
  )
  return updated
}

export const UserStore = {
  state: {
    jwt: null,
    loginError: null,
    principal: null,
    isImpersonating: false,
    version: 2
  },
  mutations: {
    'storeInit': (state, a, b, c) => {
      // TODO: check state for principal / jwt; if exists, fetch JWT and set the principal again...
      // if call fails, logout / dump state / whatever we do on logout
    },
    [UserMutations.SET_JWT]: (state, jwt) => {
      state.jwt = jwt
    },
    [UserMutations.LOGIN_ERROR]: (state, err) => (state.loginError = err),
    [UserMutations.SET_PRINCIPAL]: (state, principal) => {
      state.principal = {
        ...state.principal,
        ...principal
      }
    },
    [UserMutations.TOGGLE_IMPERSONATION]: state => {
      state.isImpersonating = !state.isImpersonating
    },
    [UserMutations.SET_PROFILE]: (state, profileUrl) => {
      state.principal.member.profileUrl = profileUrl
    },
    [UserMutations.ADD_INTEGRATION]: (state, integration) => {
      state.principal.member.tenantIntegrations.push(integration)
    },
    [UserMutations.SET_SLUG]: (state, slug) => {
      state.principal.member.slugs = [slug]
    }
  },
  actions: {
    async [UserActions.LOGIN]({ commit }, creds) {
      const response = await apolloClient.mutate({
        mutation: LOGIN,
        variables: { creds },
        fetchPolicy: 'no-cache'
      })
      let { success, token, principal, reason } = _.get(
        response,
        'data.login',
        {}
      )
      if (success) {
        principal = parseLegacyPrincipal(principal)
        commit(UserMutations.SET_JWT, token)
        commit(UserMutations.SET_PRINCIPAL, principal)
      }
      return { success, token, principal, reason }
    }
  },
  getters: {
    displayName: state => {
      return state.principal && state.principal.member.displayName
    },
    contactId: state => {
      return state.principal && state.principal.member.contacts[0].id
    },
    memberId: state => {
      return state.principal && state.principal.memberId
    },
    slug: state => {
      return state.principal && state.principal.member.slugs[0].slug
    }
  }
}
