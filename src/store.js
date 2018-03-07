import Vue from 'vue'
import Vuex from 'vuex'
import UserStore from '@/stores/UserStore'
import TeamStore from '@/stores/TeamStore'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user: UserStore,
    team: TeamStore
  }
})
