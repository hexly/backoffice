import Vue from 'vue'
import Vuetify from 'vuetify'
import App from './App.vue'
import router from './router'
import store from './store'
import Chartkick from 'chartkick'
import VueChartkick from 'vue-chartkick'
import 'chart.js'
import 'vuetify/dist/vuetify.min.css'
import { apolloProvider } from './vue-apollo'

Vue.use(VueChartkick, {
  Chartkick
})

Vue.use(Vuetify)
Vue.config.productionTip = false

// Removing service worker since we dont use it
// At some point in the future we will want to use it
// and properly leverage it but for now, its just annoying
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for (let registration of registrations) {
      registration.unregister()
    }
  })
}

new Vue({
  provide: apolloProvider.provide(),
  router,
  store,
  render: h => h(App)
}).$mount('#app')
