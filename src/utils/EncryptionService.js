import axios from 'axios'

const ENDPOINT = process.env.VUE_APP_ENCRYPTION_ENDPOINT || 'https://eaas.dev.hexly.cloud/encrypt'

export const encrypt = payload => {
  if (ENDPOINT.indexOf('localhost') > -1) {
    return new Promise((resolve, reject) => {
      const mock = {
        encryptedValue: 'ksjdfioasdfjasjbdfasdiufahjldksfjasd'
      }
      if (payload.metadata) {
        mock.metadata = payload.metadata
      }
      resolve({
        payload: mock,
        signature: {
          alg: 'sha256',
          sig: 'alskdjfaiosdjklwenioasdjf'
        }
      })
    })
  }
  return axios.post(ENDPOINT, {
    ...payload,
    key: 'green-horizen'
  }).then(res => {
    return res.data
  }).catch(err => {
    console.warn(err)
  })
}
