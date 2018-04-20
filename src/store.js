import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import { UserStore } from '@/stores/UserStore'
import { ClaimStore } from '@/stores/ClaimStore'
import TeamStore from '@/stores/TeamStore'
const { VUE_APP_API_ENDPOINT, VUE_APP_TENANT_ID, VUE_APP_LANE } = process.env

Vue.use(Vuex)

export const Mutations = {
  INIT: 'storeInit'
}

export const Actions = {
  LOGOUT: 'logout',
  AVATAR_UPLOAD: 'avatarUpload'
}

const store = new Vuex.Store({
  plugins: [
    store => {
      store.commit(Mutations.INIT)
      store.subscribe((mutation, state) => {
        localStorage.setItem('store', JSON.stringify(state))
      })
    }
  ],
  modules: {
    user: UserStore,
    team: TeamStore,
    claim: ClaimStore
  },
  actions: {
    [Actions.LOGOUT]: () => {
      localStorage.clear()
    },
    [Actions.AVATAR_UPLOAD]: async (context, { file }) => {
      const { data } = await axios.get(
        `${VUE_APP_API_ENDPOINT}/storage/destinations/${VUE_APP_TENANT_ID}/cloudinary`,
        { params: { lane: VUE_APP_LANE } }
      )

      const formData = new FormData()
      formData.set('file', file)
      Object.keys(data.fields).forEach(f => formData.set([f], data.fields[f]))
      return axios.post(data.url, formData)
    }
  },
  mutations: {
    [Mutations.INIT](state) {
      if (localStorage.getItem('store')) {
        const hydratedState = JSON.parse(localStorage.getItem('store'))
        axios.interceptors.request.use(config => {
          if (config.url.indexOf(VUE_APP_API_ENDPOINT) > -1) {
            config.headers['Authorization'] = `Bearer ${hydratedState.user.jwt}`
          }
          return config
        })
        this.replaceState(Object.assign(state, hydratedState))
      }
    }
  }
})

export default store
