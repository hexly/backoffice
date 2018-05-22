import Vue from 'vue'
import Vuetify from 'vuetify'
import App from './App.vue'
import router from './router'
import store from './store'
import Chartkick from 'chartkick'
import VueChartkick from 'vue-chartkick'
import Crisp from './plugins/crisp'
import 'chart.js'
import './registerServiceWorker'
import 'vuetify/dist/vuetify.min.css'
import { apolloProvider } from './vue-apollo'
const { VUE_APP_CRIPS_WEBSITE_ID } = process.env

Vue.use(VueChartkick, { Chartkick })

Vue.use(Crisp, { CRISP_WEBSITE_ID: VUE_APP_CRIPS_WEBSITE_ID })

Vue.use(Vuetify)
Vue.config.productionTip = false

new Vue({
  provide: apolloProvider.provide(),
  router,
  store,
  render: h => h(App)
}).$mount('#app')
