import { apolloHexlyClient, apolloFederatedClient } from '@/vue-apollo'
// eslint-disable-next-line no-unused-vars
import { LOGIN } from '@/graphql/iam.gql'
import {
  CREATE_MEMBER_INTEGRATION,
  GET_MEMBER_TENANT_INTEGRATIONS
} from '@/graphql/Integrations'
import AUTH_GQL from '@/graphql/login/auth.gql'
import { ADJUST_TAGS, UPDATE_PROFILE, GET_TAGS } from '@/graphql/Member.gql'
import _ from 'lodash'

export const UserActions = {
  LOGIN: 'login',
  LOGIN_SUCCESS: 'loginSuccess',
  SAVE_PROFILE: 'saveProfile',
  GET_TAGS: 'getTags',
  ADJUST_TAGS: 'adjustTags',
  CREATE_INTEGRATION: 'createIntegration',
  REMOVE_INTEGRATION: 'removeIntegration',
  RELOAD_INTEGRATIONS: 'reloadIntegrations'
}

export const UserMutations = {
  SET_JWT: 'setJwt',
  SET_FED_JWT: 'setFedJwt',
  AUTH_STATUS: 'authStatus',
  LOGIN_ERROR: 'setLoginError',
  SET_PRINCIPAL: 'setPrincipal',
  TOGGLE_IMPERSONATION: 'toggleImpersonation',
  SET_PROFILE: 'setProfilePic',
  ADD_INTEGRATION: 'addTenantIntegration',
  SET_INTEGRATIONS: 'setTenantIntegration',
  REMOVE_INTEGRATION: 'removeTenantIntegration',
  SET_SLUG: 'user:setSlug',
  SET_TAGS: 'user:setTags',
  RESET: 'user:reset'
}

// eslint-disable-next-line no-unused-vars
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
      tenant: {
        integrations: []
      },
      memberId: null,
      member: {
        tenantIntegrations: [],
        displayName: null,
        contacts: [],
        slugs: [],
        customer: null,
        tags: []
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
    [UserMutations.SET_FED_JWT]: (state, jwt) => (state.jwtFed = jwt),
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
    [UserMutations.SET_INTEGRATIONS]: (state, integrations) => {
      const principal = _.cloneDeep(state.principal)
      _.merge(principal, integrations)
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
    async [UserActions.LOGIN]({ commit, dispatch, state }, creds) {
      const { email, password, tenantId } = creds

      const res = await apolloFederatedClient.mutate({
        mutation: AUTH_GQL,
        variables: {
          input: {
            username: email,
            password,
            context: {
              tenantId,
              version: 2,
              includeLegacy: true
            }
          }
        }
      })

      const auth = _.get(res, 'data.iam.authenticate')
      const success = _.get(auth, 'success')
      const token = auth.authentication ? auth.authentication.token : undefined
      if (token && success) {
        const md = auth.metadata
        console.log({ md })
        const { identityId, auditId, tenantId, credentialId } = md.claims

        const principal = {
          identityId, auditId, tenantId, credentialId
        }
        const memberId = _.get(md, 'member.id')

        if (md.member && md.member.id) {
          principal.memberId = md.member && md.member.id
          principal.member = md.member
          principal.member.displayName = md.member.name
        }

        if (md.permissions) {
          principal.permissions = md.permissions
        }

        commit(UserMutations.SET_JWT, md.legacyJwt || token)
        commit(UserMutations.SET_FED_JWT, token)
        const tags = await dispatch(UserActions.GET_TAGS, { tenantId, memberId })
        principal.member = { ...principal.member, tags }
        commit(UserMutations.SET_PRINCIPAL, principal)
      } else {
        commit(
          UserMutations.LOGIN_ERROR,
          'Login failed: ' + auth.message
        )
      }

      // const response = await apolloHexlyClient.mutate({
      //   mutation: LOGIN,
      //   variables: { creds },
      //   fetchPolicy: 'no-cache'
      // })
      // let { success, token, principal, reason, issued } = _.get(
      //   response,
      //   'data.login',
      //   {}
      // )
      // if (success && issued) {
      //   principal = parseLegacyPrincipal(principal)
      //   const statusId = _.get(principal, 'member.statusId')
      //   const tags = _.get(principal, 'member.tags')
      //   // Status Id 1 = Active Member
      //   if (statusId !== 1 || tags.indexOf('backoffice:locked') >= 0) {
      //     success = false
      //   } else {
      //     commit(UserMutations.SET_JWT, token)
      //     commit(UserMutations.SET_PRINCIPAL, principal)
      //   }
      // }
      // return { success, token, principal, reason, issued }
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
    async [UserActions.GET_TAGS]({ commit }, input) {
      const { memberId, tenantId } = input
      const res = await apolloFederatedClient.query({
        query: GET_TAGS,
        variables: {
          input: {
            tenantIn: [tenantId],
            idIn: [memberId]
          }
        }
      })
      const tags = _.get(res, 'data.membership.search.results[0].tags', [])
      const parsedTags = tags.map(tag => tag.name)

      // commit(UserMutations.SET_TAGS, tags)
      return parsedTags
    },
    async [UserActions.RELOAD_INTEGRATIONS]({ commit }, input) {
      const { data } = await apolloHexlyClient.query({
        query: GET_MEMBER_TENANT_INTEGRATIONS,
        fetchPolicy: 'network-only'
      })

      commit(UserMutations.SET_INTEGRATIONS, data.getPrincipal)
      return data.getPrincipal.member.tenantIntegrations
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
    currencyCode: state => {
      // I hate this so much
      const currency = ['USD', 'CAD', 'GBP']
      const currencyIds =
        state.principal &&
        state.principal.member &&
        state.principal.member.market &&
        state.principal.member.market.supportedCurrencyIds
      const currencyId = currencyIds[0] || 0
      return currency[currencyId]
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
      (state.principal &&
      state.principal.member &&
      state.principal.member.tenantIntegrations) || [],
    integrations: state =>
      (state.principal &&
      state.principal.tenant &&
      state.principal.tenant.integrations) || []
  }
}
