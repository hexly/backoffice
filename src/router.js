import Vue from 'vue'
import Router from 'vue-router'
import store from './store'
import Login from './views/Login.vue'
import AccountClaim from './views/AccountClaim.vue'
import PasswordReset from './views/PasswordReset.vue'
import Backoffice from './views/Backoffice.vue'
import Dashboard from './views/Dashboard.vue'
import Profile from './views/Profile.vue'
import Assets from './views/Assets.vue'
import Team from './views/Team.vue'
import Sales from './views/Sales.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      beforeEnter: (to, from, next) => {
        if (store.state.user.authorized) {
          next('/dashboard')
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
          next('/dashboard')
        } else {
          next()
        }
      }
    },
    {
      path: '/account/reset/:token',
      name: 'password-rest',
      component: PasswordReset,
      beforeEnter: (to, from, next) => {
        if (store.state.user.authorized) {
          next('/dashboard')
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
          path: 'dashboard',
          alias: '',
          name: 'dashboard',
          component: Dashboard
        },
        {
          path: 'profile',
          name: 'profile',
          component: Profile
        },
        {
          path: 'assets',
          name: 'assets',
          component: Assets
        },
        {
          path: 'sales',
          name: 'sales',
          component: Sales
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
