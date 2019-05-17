import * as SalesService from './Service'

export const Actions = {
  GET_MEMBER_STATS: 'sales:memberStats',
  GET_FRONTLINE_STATS: 'sales:frontlineStats'
}

export const Mutations = {
  SET_ONE: 'MemberSetOne',
  SET: 'MemberSet'
}

export default {
  mutations: {
    [Mutations.SET]: (state, [value, fn]) => fn(state, value),
    [Mutations.SET_ONE]: (state, { property, value }) =>
      (state[property] = value)
  },
  actions: {
    [Actions.GET_MEMBER_STATS]: (_, payload) =>
      SalesService.getMemberStats(payload),
    [Actions.GET_FRONTLINE_STATS]: (_, payload) =>
      SalesService.setMemberAttributes(payload)
  }
}
