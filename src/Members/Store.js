import * as Member from './Service'

export const Actions = {
  ATTRIBUTE: 'memberGetAttribute',
  SET_ATTRIBUTE: 'memberSetAttribute',
  GET_ATTRIBUTES: 'memberGetAttributes'
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
      Member.getMemberAttribute(payload),
    [Actions.SET_ATTRIBUTE]: (_, payload) =>
      Member.setMemberAttributes(payload),
    [Actions.GET_ATTRIBUTES]: (_, payload) =>
      Member.getMemberAttributes(payload)
  }
}
