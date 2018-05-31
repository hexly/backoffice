import ClaimApi from '@/api/claim'

export const ClaimActions = {
  GET_TOKEN: 'getToken',
  CONSUME_TOKEN: 'consumeToken',
  RESET_PASSWORD: 'resetPassword',
  CLAIM: 'claim',
  RESET: 'reset'
}

export const ClaimStore = {
  state: {},
  mutations: {},
  actions: {
    [ClaimActions.GET_TOKEN]: ({ commit }, token) => {
      return ClaimApi.get(token)
    },
    [ClaimActions.CONSUME_TOKEN]: ({ commit }, { token, member }) => {
      return ClaimApi.consume(token, member)
    },
    [ClaimActions.RESET_PASSWORD]: ({ commit }, { token, credentials }) => {
      return ClaimApi.resetPassword(token, credentials)
    },
    [ClaimActions.CLAIM]: ({ commit }, email) => {
      return ClaimApi.create(email, 'claim')
    },
    [ClaimActions.RESET]: ({ commit }, email) => {
      return ClaimApi.create(email, 'reset')
    }
  },
  getters: {}
}
