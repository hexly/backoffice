import Vue from 'vue'
import Router from 'vue-router'
import store from './store'
import Login from './views/Login.vue'
import AccountClaim from './views/AccountClaim.vue'
import Backoffice from './views/Backoffice.vue'
import Home from './views/Home.vue'
import About from './views/About.vue'
import Team from './views/Members.vue'
import Orders from './views/Orders.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      beforeEnter: (to, from, next) => {
        if (store.state.user.authorized) {
          next('/home')
        } else {
          next()
        }
      }
    },
    {
      path: '/account/claim/:token',
      name: 'account-claim',
      component: AccountClaim,
      beforeEnter: (to, from, next) => {
        if (store.state.user.authorized) {
          next('/home')
        } else {
          next()
        }
      }
    },
    {
      path: '/',
      name: 'backoffice',
      component: Backoffice,
      beforeEnter: (to, from, next) => {
        if (!store.state.user.authorized) {
          next('/login')
        } else {
          next()
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
