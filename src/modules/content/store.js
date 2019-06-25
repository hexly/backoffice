import moment from 'moment'

import * as Content from '@/modules/content/service'
import store from '@/store'

export const ContentActions = {
  REFRESH_ASSET_META: 'content:RefreshAssetMeta',
  REFRESH_ASSETS: 'content:RefreshAssets',
  UPDATE_ASSET: 'content:UpdateAsset',
  REMOVE_ASSET: 'content:RemoveAsset'
}

export const ContentMutations = {
  REMOVE: 'removeUpdate',
  SET_ONE: 'contentSetOne',
  SET: 'contentSet',
  UPDATE: 'contentUpdate'
}

export const ContentGetters = {
  assets: 'contentAssets',
  assetMeta: 'contentAssetMeta'
}

const META_DEFAULT = {
  approval: [],
  audiences: [],
  error: undefined,
  fetching: false,
  refreshed: null,
  tags: [],
  types: []
}
const ASSET_DEFAULT = {
  assets: [],
  fetching: false,
  refreshed: null
}

const DEFAULT_STATE = {
  assets: { ...ASSET_DEFAULT },
  meta: { asset: { ...META_DEFAULT } }
}
export default {
  state: DEFAULT_STATE,
  mutations: {
    [ContentMutations.SET]: (state, [value, fn]) => fn(state, value),
    [ContentMutations.SET_ONE]: (state, { property, value }) =>
      (state[property] = value),
    [ContentMutations.INIT]: state => Object.assign(state, DEFAULT_STATE),
    [ContentMutations.UPDATE]: (state, asset) => {
      const { assets } = state
      const assetToUpdate = assets.find(a => a.id === asset.id) || {}

      state.assets = assets
        .filter(a => a.id !== asset.id)
        .concat([{ ...assetToUpdate, ...asset }])
    },
    [ContentMutations.REMOVE]: (state, asset) => {
      const { assets } = state
      state.assets.assets = assets.assets.filter(a => a.id !== asset.id)
    }
  },
  actions: {
    [ContentActions.REFRESH_ASSET_META]: async ({ commit, state }) => {
      // reset state
      commit(ContentMutations.SET, [
        { ...state.meta.asset, fetching: true, error: null },
        (state, value) => Object.assign(state.meta.asset, value)
      ])

      const assetMeta = await Content.getAssetMeta()

      commit(ContentMutations.SET, [
        { ...META_DEFAULT, ...assetMeta, refreshed: moment().toISOString() },
        (state, value) => Object.assign(state.meta.asset, value)
      ])
    },
    [ContentActions.REFRESH_ASSETS]: async ({ commit, state }) => {
      // reset state
      commit(ContentMutations.SET, [
        { ...state.assets, fetching: true, error: null },
        (state, value) => Object.assign(state.assets.assets, value)
      ])

      const { member } = store.state
      const filter = {
        owners: [member.id],
        visibilityIds: [200, 201, 202, 203, 204]
      }
      const assets = await Content.getAllAssets('personal', {
        ...filter,
        includeThumbnails: false,
        includeSources: false
      })

      commit(ContentMutations.SET, [
        { ...ASSET_DEFAULT, ...assets, refreshed: moment().toISOString() },
        (state, value) => Object.assign(state.assets, value)
      ])
    },
    [ContentActions.UPDATE_ASSET]: async ({ commit, state }, asset) => {
      commit(ContentMutations.UPDATE, asset)
    },
    [ContentActions.REMOVE_ASSET]: async ({ commit, state }, asset) => {
      commit(ContentMutations.REMOVE, asset)
    }
  },
  getters: {
    [ContentGetters.assetMeta]: state => state.meta.asset,
    [ContentGetters.assets]: state => state.assets
  }
}
