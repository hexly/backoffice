const tenantId = ~~process.env.VUE_APP_TENANT_ID
const BASE_URL = process.env.VUE_APP_API_ENDPOINT || 'http://localhost:3000'

export const getAsset = (assetId) => `${BASE_URL}/assets/${tenantId}/${assetId}`
