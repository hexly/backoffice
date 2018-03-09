import Vue from 'vue'
import Vuetify from 'vuetify'
import App from './App.vue'
import router from './router'
import store from './store'
import Chartkick from 'chartkick'
import VueChartkick from 'vue-chartkick'
import 'chart.js'
import './registerServiceWorker'
import 'vuetify/dist/vuetify.min.css'

Vue.use(VueChartkick, { Chartkick })

Vue.use(Vuetify)
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
