import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import { UserStore } from '@/stores/UserStore'
import { ClaimStore } from '@/stores/ClaimStore'
const {
  VUE_APP_API_ENDPOINT = 'http://localhost:3000',
  VUE_APP_TENANT_ID,
  VUE_APP_LANE
} = process.env

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
    if (jwt && config.url && config.url.indexOf(VUE_APP_API_ENDPOINT) > -1) {
      config.headers = config.headers || {}
      config.headers.common = config.headers.common || {}
      config.headers.common['Authorization'] = `Bearer ${jwt}`
    }
    return config
  })
}

const verifyPrincipal = async hydratedState => {
  if (!hydratedState.user.principal || !hydratedState.user.principal) {
    localStorage.clear()
    window.location = '/'
  }
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
      if (Array.isArray(setup)) {
        setup.forEach(s => s(hydratedState))
      }
      if (typeof setup === 'function') {
        setup(hydratedState)
      }
      state = Object.assign(state, hydratedState)
    }
  }
}

export default new Vuex.Store({
  plugins: [DejaVue.plugin(Mutations.INIT, 'store')],
  modules: {
    user: UserStore,
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
      try {
        const { data } = await axios.get(
          `${VUE_APP_API_ENDPOINT}/storage/destinations/${VUE_APP_TENANT_ID}/cloudinary`,
          { params: { lane: VUE_APP_LANE } }
        )

        const formData = new FormData()
        formData.set('file', file)
        Object.keys(data.fields).forEach(f => formData.set([f], data.fields[f]))
        return axios.post(data.url, formData)
      } catch (error) {
        console.log({ error })
      }
    }
  },
  mutations: {
    [Mutations.INIT]: DejaVue.mutation('store', [axiosSetup, verifyPrincipal])
  }
})
