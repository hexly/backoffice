import { apolloClient } from '@/vue-apollo'
import { GET_MEMBER_ATTRIBUTE, SET_MEMBER_ATTRIBUTE } from './Api.js'

export const getMemberAttributes = (input) => {
  return apolloClient.query({
    query: GET_MEMBER_ATTRIBUTE,
    variables: { input }
  })
    .then(({ data: { getMemberAttribute } }) => getMemberAttribute)
}

export const setMemberAttribtues = (payload) => {
  return apolloClient.mutate({
    mutation: SET_MEMBER_ATTRIBUTE,
    variables: { input: payload }
  })
}
