import ClaimApi from '@/api/claim'

export const ClaimActions = {
  GET_TOKEN: 'getToken',
  CONSUME_TOKEN: 'consumeToken'
}

export const ClaimStore = {
  state: {},
  mutations: {},
  actions: {
    [ClaimActions.GET_TOKEN]: async ({ commit }, token) => {
      return ClaimApi.get(token)
    },
    [ClaimActions.CONSUME_TOKEN]: async ({ commit }, { token, member }) => {
      return ClaimApi.consume(token, member)
    }
  },
  getters: {}
}
