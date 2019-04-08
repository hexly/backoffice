import axios from 'axios'

export const encrypt = (value) => {
  return axios.post(process.env.VUE_APP_ENCRYPTION_ENDPOINT.value)
}
