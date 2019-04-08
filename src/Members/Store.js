import * as Member from './Service'

export const Actions = {
  ATTRIBUTE: 'memberGetAttribute',
  SET_ATTRIBUTE: 'memberSetAttribute'
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
    [Actions.ATTRIBUTE]: (_, payload) =>
      Member.getMemberAttributes(payload),
    [Actions.SET_ATTRIBUTE]: (_, payload) =>
      Member.setMemberAttribtues(payload)
  }
}
