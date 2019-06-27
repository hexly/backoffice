import { get } from 'lodash'

import { assetMeta, assetCreate, seachAllAssets, getAssets } from './content.gql'
import { apolloClient } from '@/vue-apollo'

const doQuery = (query, args = {}) => {
  return apolloClient.query({
    query: query,
    variables: args,
    fetchPolicy: 'network-only'
  })
}

const doMutate = (mutation, args = {}) =>
  apolloClient.mutate({ mutation, variables: args })

export const getAssetMeta = async avail => {
  const result = await doQuery(assetMeta)
  const tags = get(result, 'data.assetManagementConfig.tags', [])
  return {
    providers: get(result, 'data.assetManagementConfig.providers', []),
    approval: tags.filter(e => e.key.indexOf('approval:') === 0),
    tags: tags.filter(e => e.key.indexOf('search:') === 0),
    audiences: tags.filter(e => e.key.indexOf('aud:') === 0),
    types: get(result, 'data.assetManagementConfig.types', [])
  }
}

export const createAsset = async input => {
  const result = await doMutate(assetCreate, { input })
  return get(result, 'data.assetCreate', {})
}

export const searchAssets = async (op, input, jwt) => {
  const result = await doQuery(seachAllAssets(op), { input })
  return get(result, 'data.assetSearch')
}

export const getAllAssets = async (op, input, jwt) => {
  const result = await doQuery(getAssets(op), { input })
  return get(result, 'data', [])
}
