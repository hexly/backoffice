import axios from 'axios'
const { VUE_APP_API_ENDPOINT, VUE_APP_TENANT_ID } = process.env

export default {
  create: (email, type) => {
    return axios.post(`${VUE_APP_API_ENDPOINT}/auth/one-time-tokens`, {
      email,
      tenantId: VUE_APP_TENANT_ID,
      type
    })
  },
  get: token => {
    return axios.get(`${VUE_APP_API_ENDPOINT}/auth/one-time-tokens/${token}`)
  },
  resetPassword: (token, credential) => {
    return axios.post(
      `${VUE_APP_API_ENDPOINT}/auth/one-time-tokens/${token}/reset`,
      credential
    )
  },
  consume: (token, member) => {
    return axios.post(
      `${VUE_APP_API_ENDPOINT}/auth/one-time-tokens/${token}/consume`,
      member
    )
  }
}
