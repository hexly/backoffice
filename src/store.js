import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import sha1 from 'sha1'
import { UserStore } from '@/stores/UserStore'
import TeamStore from '@/stores/TeamStore'
const {
  VUE_APP_CLOUDINARY_UPLOAD,
  VUE_APP_CLOUDINARY_SECRET,
  VUE_APP_CLOUDINARY_KEY
} = process.env

window.sha1 = sha1

Vue.use(Vuex)

export const Mutations = {
  INIT: 'storeInit'
}

export const Actions = {
  LOGOUT: 'logout',
  FILE_UPLOAD: 'fileUpload'
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
    team: TeamStore
  },
  actions: {
    [Actions.LOGOUT]: () => {
      localStorage.clear()
    },
    [Actions.FILE_UPLOAD]: (context, { file, name }) => {
      const timestamp = Date.now()
      const fields = `invalidate=true&public_id=${name}&timestamp=${timestamp}${VUE_APP_CLOUDINARY_SECRET}`
      const signature = sha1(fields)
      const formData = new FormData()
      formData.set('file', file)
      formData.set('api_key', VUE_APP_CLOUDINARY_KEY)
      formData.set('public_id', name)
      formData.set('timestamp', timestamp)
      formData.set('signature', signature)
      formData.set('invalidate', true)
      return axios.post(VUE_APP_CLOUDINARY_UPLOAD, formData)
    }
  },
  mutations: {
    [Mutations.INIT](state) {
      if (localStorage.getItem('store')) {
        this.replaceState(
          Object.assign(state, JSON.parse(localStorage.getItem('store')))
        )
      }
    }
  }
})

export default store
