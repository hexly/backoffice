import axios from 'axios'

const ENDPOINT =
  process.env.VUE_APP_ENCRYPTION_ENDPOINT ||
  'https://eaas.dev.hexly.cloud/encrypt'

export const encrypt = (payload, suffix) => {
  return axios
    .post(ENDPOINT, {
      ...payload,
      key: `green-horizen${suffix ? '-' + suffix : ''}`
    })
    .then(res => {
      return res.data
    })
}
