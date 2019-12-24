import { apolloHexlyClient } from '@/vue-apollo'
import { GET_MEMBER_ATTRIBUTE, SET_MEMBER_ATTRIBUTE, GET_MEMBER_ATTRIBUTES } from './Api.js'

export const getMemberAttribute = (input) => {
  return apolloHexlyClient.query({
    query: GET_MEMBER_ATTRIBUTE,
    variables: { input }
  })
    .then(({ data: { getMemberAttribute } }) => getMemberAttribute)
}

export const setMemberAttributes = (payload) => {
  return apolloHexlyClient.mutate({
    mutation: SET_MEMBER_ATTRIBUTE,
    variables: { input: payload },
    fetchPolicy: 'no-cache'
  })
}

export const getMemberAttributes = (payload) => {
  return apolloHexlyClient.query({
    query: GET_MEMBER_ATTRIBUTES,
    variables: { input: payload },
    fetchPolicy: 'no-cache'
  })
}
