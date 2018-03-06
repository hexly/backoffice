import Vue from 'vue'
import Router from 'vue-router'
import store from './store'
import Home from './views/Home.vue'
import About from './views/About.vue'
import Login from './views/Login.vue'
import Backoffice from './views/Backoffice.vue'
import Team from './views/Members.vue'
import Orders from './views/Orders.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/',
      name: 'backoffice',
      component: Backoffice,
      beforeRouteEnter: (to, from, next) => {
        if (!store.state.authorized) {
          next('/login') // they are not authorized, so redirect to login
        } else {
          next() // we are authorized, continue on to the requested route
        }
      },
      children: [
        {
          path: 'home',
          alias: '',
          name: 'home',
          component: Home
        },
        {
          path: 'about',
          name: 'about',
          component: About
        },
        {
          path: 'orders',
          name: 'orders',
          component: Orders
        },
        {
          path: 'team',
          name: 'team',
          component: Team
        }
      ]
    }
  ]
})
