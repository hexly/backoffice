import axios from 'axios'
const { VUE_APP_API_ENDPOINT, VUE_APP_TENANT_ID } = process.env

export default {
  get: token => {
    return axios.get(`${VUE_APP_API_ENDPOINT}/auth/one-time-tokens/${token}`)
  },
  consume: (token, member) => {
    return axios.post(
      `${VUE_APP_API_ENDPOINT}/auth/one-time-tokens/${token}/consume`,
      member
    )
  },
  claim: email => {
    return axios.post(`${VUE_APP_API_ENDPOINT}/auth/claim`, {
      email,
      tenantId: VUE_APP_TENANT_ID
    })
  }
}
