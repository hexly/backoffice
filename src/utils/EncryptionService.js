import axios from 'axios'

export const encrypt = (value) => {
  if (process.env.VUE_APP_ENCRYPTION_ENDPOINT.indexOf('localhost') > -1) {
    return new Promise((resolve, reject) => {
      resolve({ data: { ip: 'test' } })
    })
  }
  return axios.post(process.env.VUE_APP_ENCRYPTION_ENDPOINT, value)
}
