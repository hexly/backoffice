import { apolloClient } from '@/vue-apollo'
import { GET_MEMBER_ATTRIBUTE, SET_MEMBER_ATTRIBUTE, GET_MEMBER_ATTRIBUTES } from './Api.js'

export const getMemberAttribute = (input) => {
  return apolloClient.query({
    query: GET_MEMBER_ATTRIBUTE,
    variables: { input }
  })
    .then(({ data: { getMemberAttribute } }) => getMemberAttribute)
}

export const setMemberAttributes = (payload) => {
  return apolloClient.mutate({
    mutation: SET_MEMBER_ATTRIBUTE,
    variables: { input: payload }
  })
}

export const getMemberAttributes = (payload) => {
  return apolloClient.query({
    query: GET_MEMBER_ATTRIBUTES,
    variables: { input: payload }
  })
}
