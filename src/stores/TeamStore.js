import TeamApi from '@/api/team'

export default {
  state: {
    team: [],
    path: []
  },
  mutations: {
    saveTeam(state, team) {
      state.team = team
    }
  },
  actions: {
    async getTeam({ commit, state }, id) {
      const team = await TeamApi.getTeam(id)
      commit('saveTeam', team)
    }
  },
  getters: {}
}
