import Vue from 'vue'
import Vuex from 'vuex'
import UserStore from '@/stores/UserStore'
import TeamStore from '@/stores/TeamStore'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    user: UserStore,
    team: TeamStore
  },
  mutations: {
    initStore(state) {
      if (localStorage.getItem('store')) {
        this.replaceState(
          Object.assign(state, JSON.parse(localStorage.getItem('store')))
        )
      }
    }
  }
})

store.subscribe((mutation, state) => {
  localStorage.setItem('store', JSON.stringify(state))
})

export default store
