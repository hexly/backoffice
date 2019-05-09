import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'

import Chartkick from 'chartkick'
import VueChartkick from 'vue-chartkick'
import 'chart.js'

import _ from 'lodash'

import App from './App.vue'
import router from './router'
import store from './store'

import { apolloProvider } from './vue-apollo'

import tenantInfo from '@/tenant.js'

try {
  const mf = require('./build.info.json')
  window.$version = mf.buildTime
} catch (err) {
  console.warn('Failed to load build.info.json', err)
}

Vue.use(VueChartkick, {
  Chartkick
})

Vue.use(Vuetify)
Vue.config.productionTip = false

// Removing service worker since we dont use it
// At some point in the future we will want to use it
// and properly leverage it but for now, its just annoying
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      registration.unregister()
    }
  })
}

window.zE &&
  window.zE('webWidget:on', 'open', () => {
    const principal = _.get(store, 'state.user.principal', {})
    if (principal) {
      const {
        displayName,
        memberId,
        identityId,
        username,
        contactEmail
      } = principal

      const name = displayName
      const email = contactEmail || username

      window.zE('webWidget', 'identify', {
        name: displayName,
        email,
        memberId,
        identityId
      })
      window.zE('webWidget', 'prefill', {
        name: {
          value: name,
          readOnly: true // optional
        },
        email: {
          value: email,
          readOnly: true // optional
          // },
          // phone: {
          //   value: '61431909749',
          //   readOnly: true // optional
        }
      })
    }
  })

Vue.prototype.$tenantInfo = tenantInfo

new Vue({
  provide: apolloProvider.provide(),
  router,
  store,
  render: h => h(App)
}).$mount('#app')
