import store from '@/store'

const tenantId = store.state.tenantId
const BASE_URL = process.env.VUE_APP_BASE_URL || 'http://localhost:3000'

export const getAsset = (assetId) => `${BASE_URL}/assets/${tenantId}/${assetId}`
