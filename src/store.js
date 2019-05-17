import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import { UserStore } from '@/stores/UserStore'
import { ClaimStore } from '@/stores/ClaimStore'
import MemberStore from '@/Members/Store'

const {
  VUE_APP_API_ENDPOINT = 'http://localhost:3000',
  VUE_APP_TENANT_ID,
  VUE_APP_LANE
} = process.env

Vue.use(Vuex)

axios.interceptors.request.use(config => {
  // We want to be pulling this from the source of all truth.
  // We dont want to just get the jwt on startup
  const dehydratedState = localStorage.getItem('store')
  if (dehydratedState && config.url && config.url.indexOf(VUE_APP_API_ENDPOINT) > -1) {
    const hydratedState = JSON.parse(dehydratedState)
    config.headers = config.headers || {}
    config.headers.common = config.headers.common || {}
    config.headers.common['Authorization'] = `Bearer ${hydratedState.user.jwt}`
  }
  return config
})

export const Mutations = {
  INIT: 'storeInit',
  SET_GATE: 'setGate',
  SET_LOADING: 'setLoading'
}

export const Actions = {
  LOGOUT: 'logout',
  AVATAR_UPLOAD: 'avatarUpload'
}

const verifyPrincipal = async hydratedState => {
  if (!hydratedState.user || !hydratedState.user.principal) {
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
      if (
        hydratedState &&
        hydratedState.user &&
        hydratedState.user.version >= 2
      ) {
        if (typeof setup === 'function') {
          setup(hydratedState)
        }
        state = Object.assign(state, hydratedState)
      }
    }
  }
}

export default new Vuex.Store({
  plugins: [DejaVue.plugin(Mutations.INIT, 'store')],
  modules: {
    user: UserStore,
    claim: ClaimStore,
    member: MemberStore
  },
  state: {
    locale: 'en-us',
    showGate: false,
    loading: false
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
        console.error({ error })
      }
    }
  },
  mutations: {
    [Mutations.INIT]: DejaVue.mutation('store', [verifyPrincipal]),
    [Mutations.SET_LOADING]: (state, loading) => {
      state.loading = loading
    },
    [Mutations.SET_GATE]: (state, show) => {
      state.showGate = show
    }
  }
})
