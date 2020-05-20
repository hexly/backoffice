import Vue from 'vue'
import Router from 'vue-router'
import tenantInfo from '@/tenant.js'
import store from './store'
import Login from './views/Login.vue'
import AccountClaim from './views/AccountClaim.vue'
import PasswordReset from './views/PasswordReset.vue'
import Backoffice from './views/Backoffice.vue'
import Integrations from './views/Integrations.vue'
import Announcements from './views/Announcements.vue'
import Profile from './views/Profile.vue'
import Assets from './views/Assets.vue'
import Team from './views/Team.vue'
import Payouts from './views/Payouts.vue'
import Sales from './views/Sales.vue'
import Impersonate from './views/Impersonate.vue'
import Redirect from './views/Redirect.vue'
import Zendesk from './zendesk/Zendesk.vue'
import ZendeskRoot from './zendesk/root.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/impersonate/:token',
      name: 'impersonate',
      component: Impersonate
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      beforeEnter: (_, __, next) =>
        store.state.user.jwt ? next('/dashboard') : next()
    },
    {
      path: '/account/claim/:token',
      name: 'account-claim',
      component: AccountClaim,
      beforeEnter: (_, __, next) =>
        store.state.user.jwt ? next('/dashboard') : next()
    },
    {
      path: '/account/reset/:token/:email',
      name: 'password-rest',
      component: PasswordReset,
      beforeEnter: (_, __, next) => {
        store.commit(`user:reset`)
        next()
      }
    },
    {
      path: '/zendesk/',
      component: Zendesk,
      beforeEnter: (from, __, next) => {
        return !store.state.user.jwt
          ? next('/login?returnTo=' + encodeURI(from.fullPath))
          : next()
      },
      children: [
        {
          path: '',
          name: 'zendesk',
          component: ZendeskRoot
        }
      ]
    },
    {
      path: '/',
      name: 'backoffice',
      component: Backoffice,
      beforeEnter: (to, from, next) => {
        if (to.name === 'team' && !tenantInfo.features.team) {
          next(from.path)
        }
        // if (to.name === 'sales' && !tenantInfo.features.sales) {
        //   next(from.path)
        // }

        return !store.state.user.jwt
          ? next('/login?returnTo=' + encodeURI('/'))
          : next()
      },
      children: [
        {
          path: 'dashboard',
          alias: '',
          name: 'dashboard',
          component: () => {
            return import(`./views/dashboards/${process.env.VUE_APP_TENANT_ID}.vue`)
          }
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
          path: 'payouts',
          name: 'payouts',
          component: Payouts
        },
        {
          path: 'team',
          name: 'team',
          component: Team
        },
        {
          path: 'announcements',
          name: 'announcements',
          component: Announcements
        },
        {
          path: 'integrations',
          name: 'integrations',
          component: Integrations
        }
      ]
    },
    {
      path: '*',
      name: 'Backoffice Redirect',
      component: Redirect,
      beforeEnter: (_, __, next) => {
        return !store.state.user.jwt
          ? next('/login?returnTo=' + encodeURI('/'))
          : next('/dashboard')
      }
    }
  ]
})
