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

const axiosSetup = hydratedState => {
  const jwt = hydratedState && hydratedState.user && hydratedState.user.jwt
  axios.interceptors.request.use(config => {
    if (jwt && config.url.indexOf(VUE_APP_API_ENDPOINT) > -1) {
      config.headers['Authorization'] = `Bearer ${jwt}`
    }
    return config
  })
}

const DejaVue = {
  plugin: (init, localStorageName) => store => {
    store.commit(init)
    store.subscribe((mutation, state) => {
      localStorage.setItem(localStorageName, JSON.stringify(state))
    })
  },
  mutation: (localStorageName, setup) => state => {
    const dehydratedState = localStorage.getItem(localStorageName)
    if (dehydratedState) {
      const hydratedState = JSON.parse(dehydratedState)
      setup(hydratedState)
      state = Object.assign(state, hydratedState)
    }
  }
}

const store = new Vuex.Store({
  plugins: [DejaVue.plugin(Mutations.INIT, 'store')],
  modules: {
    user: UserStore,
    team: TeamStore,
    claim: ClaimStore
  },
  state: {
    locale: 'en-us'
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
    [Mutations.INIT]: DejaVue.mutation('store', axiosSetup)
  }
})

export default store
