import { apolloHexlyClient, apolloFederatedClient } from '@/vue-apollo'
import {
  CREATE_MEMBER_INTEGRATION,
  GET_MEMBER_TENANT_INTEGRATIONS
} from '@/graphql/Integrations'
import AUTH_GQL from '@/graphql/login/auth.gql'
import { ADJUST_TAGS, UPDATE_PROFILE, GET_MEMBER_DETAILS, GET_MEMBER_TENANT_INTEGRATIONS_FED } from '@/graphql/Member.gql'
import _ from 'lodash'

export const UserActions = {
  LOGIN: 'login',
  LOGIN_SUCCESS: 'loginSuccess',
  SAVE_PROFILE: 'saveProfile',
  GET_MEMBER_DETAILS: 'getTags',
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
        const { tags, baseUrl, customer, profileUrl, tenantIntegrations, contacts, statusId } = await dispatch(UserActions.GET_MEMBER_DETAILS, { tenantId, memberId })
        principal.member = { ...principal.member, tags, profileUrl, contacts, statusId }
        principal.member.customer = { ...customer }
        principal.tenant = {
          ...principal.tenant,
          integrations: tenantIntegrations,
          baseUrl,
          id: tenantId
        }
        commit(UserMutations.SET_PRINCIPAL, principal)
      } else {
        commit(
          UserMutations.LOGIN_ERROR,
          'Login failed: ' + auth.message
        )
        throw new Error('Login failed: ' + auth.message)
      }
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
    async [UserActions.GET_MEMBER_DETAILS]({ commit }, input) {
      const { memberId, tenantId } = input
      const baseUrl = process.env.VUE_APP_API_ENDPOINT

      let detailsRes
      let tenantIntegrationRes
      try {
        detailsRes = await apolloFederatedClient.query({
          query: GET_MEMBER_DETAILS,
          variables: {
            input: {
              tenantIn: [tenantId],
              idIn: [memberId]
            }
          }
        })
      } catch (error) {
        console.warn(error, { memberId, tenantId })
      }
      try {
        tenantIntegrationRes = await apolloFederatedClient.query({
          query: GET_MEMBER_TENANT_INTEGRATIONS_FED,
          variables: {
            input: {
              memberId
            }
          }
        })
      } catch (error) {
        console.warn(error, { memberId, tenantId })
      }
      const tags = _.get(detailsRes, 'data.membership.search.results[0].tags', [])
      const statusId = _.get(detailsRes, 'data.membership.search.results[0].statusId', [])
      const customer = _.get(detailsRes, 'data.membership.search.results[0].customer', [])
      const profileUrl = _.get(detailsRes, 'data.membership.search.results[0].avatar.assetUrl', [])
      const contacts = _.get(detailsRes, 'data.membership.search.results[0].contacts', [])
      const tenantIntegrations = _.get(tenantIntegrationRes, 'data.membership.getMemberTenantIntegrations', [])
      const parsedTags = tags.map(tag => tag.name)

      return { tags: parsedTags, customer, profileUrl, tenantIntegrations, contacts, baseUrl, statusId }
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
