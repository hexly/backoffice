import Vue from 'vue'
import Vuetify from 'vuetify'
import VueClipboard from 'vue-clipboard2'
import Gravatar from 'vue-gravatar'
import VueAnalytics from 'vue-analytics'
import 'vuetify/dist/vuetify.min.css'
import '@mdi/font/css/materialdesignicons.min.css'

import moment from 'moment'

import _ from 'lodash'

import * as Sentry from '@sentry/browser'
import * as Integrations from '@sentry/integrations'

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

VueClipboard.config.autoSetContainer = true // add this line
Vue.use(VueClipboard)
Vue.component('v-gravatar', Gravatar)

Vue.use(Vuetify)

const vuetify = new Vuetify({
  theme: {
    themes: {
      light: {
        primary: tenantInfo.primaryColor,
        secondary: tenantInfo.secondaryColor,
        accent: tenantInfo.accentColor
      }
    }
  }
})

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
    if (principal && principal.member) {
      const {
        member: {
          displayName,
          contacts
        },
        memberId,
        identityId,
        username
      } = principal

      let contactEmail
      if (contacts && contacts.length && contacts[0].emails.length) {
        contactEmail = contacts[0].emails[0].email
      }

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
        }
      })
    }
  })

if (process.env.VUE_APP_GA_ID) {
  Vue.use(VueAnalytics, {
    id: process.env.VUE_APP_GA_ID,
    router
  })
}

if (process.env.VUE_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.VUE_APP_SENTRY_DSN,
    integrations: [new Integrations.Vue({ Vue, attachProps: true })]
  })
}

Vue.prototype.$tenantId = ~~process.env.VUE_APP_TENANT_ID
Vue.prototype.$tenantInfo = tenantInfo
Vue.prototype.$moment = moment

Vue.prototype._ = _

new Vue({
  apolloProvider,
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
