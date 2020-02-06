import { apolloHexlyClient } from '@/vue-apollo'
import { LOGIN } from '@/graphql/iam.gql'
import { CREATE_MEMBER_INTEGRATION } from '@/graphql/Integrations'
import { ADJUST_TAGS, UPDATE_PROFILE } from '@/graphql/Member.gql'
import _ from 'lodash'

export const UserActions = {
  LOGIN: 'login',
  LOGIN_SUCCESS: 'loginSuccess',
  SAVE_PROFILE: 'saveProfile',
  ADJUST_TAGS: 'adjustTags',
  CREATE_INTEGRATION: 'createIntegration',
  REMOVE_INTEGRATION: 'removeIntegration'
}

export const UserMutations = {
  SET_JWT: 'setJwt',
  AUTH_STATUS: 'authStatus',
  LOGIN_ERROR: 'setLoginError',
  SET_PRINCIPAL: 'setPrincipal',
  TOGGLE_IMPERSONATION: 'toggleImpersonation',
  SET_PROFILE: 'setProfilePic',
  ADD_INTEGRATION: 'addTenantIntegration',
  REMOVE_INTEGRATION: 'removeTenantIntegration',
  SET_SLUG: 'user:setSlug',
  SET_TAGS: 'user:setTags',
  RESET: 'user:reset'
}

const parseLegacyPrincipal = principal => {
  const updated = {
    ...principal
  }
  updated.displayName = _.get(principal, 'member.displayName', '<Unknown Name>')
  return updated
}

const defaultState = () => {
  return {
    jwt: null,
    loginError: null,
    principal: {
      memberId: null,
      member: {
        tenantIntegrations: [],
        displayName: null,
        contacts: [],
        slugs: [],
        customer: null
      }
    },
    isImpersonating: false,
    version: 2
  }
}

export const UserStore = {
  state: defaultState(),
  mutations: {
    storeInit: (state, a, b, c) => {
      // TODO: check state for principal / jwt; if exists, fetch JWT and set the principal again...
      // if call fails, logout / dump state / whatever we do on logout
    },
    [UserMutations.RESET]: (state) => {
      const defState = defaultState()
      Object.keys(state).forEach(key => {
        state[key] = defState[key]
      })
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
      const principal = _.cloneDeep(state.principal)
      const arr = _.get(principal, 'member.tenantIntegrations', [])
      principal.member.tenantIntegrations = [...arr, integration]
      state.principal = principal
    },
    [UserMutations.REMOVE_INTEGRATION]: (state, integration) => {
      const index = state.principal.member.tenantIntegrations.findIndex(
        i => integration.id === i.id
      )
      state.principal.member.tenantIntegrations.splice(index, 1)
    },
    [UserMutations.SET_SLUG]: (state, slug) => {
      state.principal = {
        ...state.principal,
        member: {
          ...state.principal.member,
          slugs: [{ slug }]
        }
      }
    },
    [UserMutations.SET_TAGS]: (state, tags) => {
      state.principal = {
        ...state.principal,
        member: {
          ...state.principal.member,
          tags
        }
      }
    }
  },
  actions: {
    async [UserActions.LOGIN]({ commit }, creds) {
      const response = await apolloHexlyClient.mutate({
        mutation: LOGIN,
        variables: { creds },
        fetchPolicy: 'no-cache'
      })
      let { success, token, principal, reason, issued } = _.get(
        response,
        'data.login',
        {}
      )
      if (success && issued) {
        principal = parseLegacyPrincipal(principal)
        commit(UserMutations.SET_JWT, token)
        commit(UserMutations.SET_PRINCIPAL, principal)
      }
      return { success, token, principal, reason, issued }
    },
    async [UserActions.SAVE_PROFILE]({ commit }, { memberId, profileUrl }) {
      await apolloHexlyClient.mutate({
        mutation: UPDATE_PROFILE,
        variables: {
          input: {
            id: memberId,
            profileUrl: profileUrl
          }
        }
      })

      commit(UserMutations.SET_PROFILE, profileUrl)
      return profileUrl
    },
    async [UserActions.ADJUST_TAGS]({ commit }, input) {
      const { data } = await apolloHexlyClient.mutate({
        mutation: ADJUST_TAGS,
        variables: {
          input
        }
      })

      commit(UserMutations.SET_TAGS, data.adjustTags.tags)
      return data.adjustTags.tags
    },
    async [UserActions.CREATE_INTEGRATION](
      { commit },
      { command, tenantIntegrationId, data }
    ) {
      return apolloHexlyClient.mutate({
        mutation: CREATE_MEMBER_INTEGRATION,
        variables: {
          input: {
            command,
            tenantIntegrationId,
            data
          }
        },
        update: (store, { data: { integrationCommand } }) => {
          commit(UserMutations.ADD_INTEGRATION, integrationCommand)
          return integrationCommand
        }
      })
    },
    async [UserActions.REMOVE_INTEGRATION](
      { commit },
      { command, tenantIntegrationId, data }
    ) {
      return apolloHexlyClient.mutate({
        mutation: CREATE_MEMBER_INTEGRATION,
        variables: {
          input: {
            command,
            tenantIntegrationId,
            data
          }
        },
        update: (store, { data: { integrationCommand } }) => {
          commit(UserMutations.REMOVE_INTEGRATION, integrationCommand)
        }
      })
    }
  },
  getters: {
    member: state => {
      return state.principal && state.principal.member
    },
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
      return (
        state.principal &&
        state.principal.member.slugs &&
        state.principal.member.slugs[0] &&
        state.principal.member.slugs[0].slug
      )
    },
    customer: state => {
      return state.principal && state.principal.member.customer
    },
    subscriptions: state => {
      return (
        state.principal &&
        state.principal.member.customer &&
        state.principal.member.customer.subscriptions
      )
    },
    tenantIntegrations: state =>
      state.principal &&
      state.principal.member &&
      state.principal.member.tenantIntegrations
  }
}
