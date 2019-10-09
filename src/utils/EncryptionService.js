import axios from 'axios'
import tenantInfo from '@/tenant.js'

const ENDPOINT =
  process.env.VUE_APP_ENCRYPTION_ENDPOINT ||
  'https://eaas.dev.hexly.cloud/encrypt'

export const encrypt = (payload, suffix) => {
  return axios
    .post(ENDPOINT, {
      ...payload,
      key: `${tenantInfo.encryptKey}${suffix ? '-' + suffix : ''}`
    })
    .then(res => {
      return res.data
    })
}
