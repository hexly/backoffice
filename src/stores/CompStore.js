import _ from 'lodash'
import { apolloHexlyClient } from '@/vue-apollo'

import {
  ENGINE_STATS_QUERY,
  ENGINE_STATS_PERIODS_QUERY
} from '@/graphql/CompStats.gql'

export const CompActions = {
  GET_STATS: 'compGetStats',
  GET_PERIODS: 'compGetPeriods',
  SELECT_PERIOD: 'compSelectPeriod'
}
export const CompMutations = {
  SET_STATS: 'compSetStats',
  SET_PERIODS: 'compSetPeriods',
  SET_SELECTED_PERIOD: 'compSetSelectedPeriod',
  STATS_LOADING: 'compStatsLoading'
}

export const CompStore = {
  state: {
    engineStatsLoading: true,
    stats: {},
    periods: {},
    selectedPeriod: {}
  },
  mutations: {
    [CompMutations.SET_STATS]: (state, stats) => {
      state.stats = stats
    },
    [CompMutations.STATS_LOADING]: (state, loading) => {
      state.engineStatsLoading = loading
    },
    [CompMutations.SET_PERIODS]: (state, periods) => {
      state.periods = periods
    },
    [CompMutations.SET_SELECTED_PERIOD]: (state, selectedPeriod) => {
      state.selectedPeriod = selectedPeriod
    }
  },
  actions: {
    [CompActions.GET_STATS]: async ({ commit }, input) => {
      commit(CompMutations.STATS_LOADING, true)
      const { data: { engineStatsByMemberIds } } = await apolloHexlyClient.query({
        query: ENGINE_STATS_QUERY,
        fetchPolicy: 'network-only',
        variables: { input }
      })
      commit(CompMutations.SET_STATS, engineStatsByMemberIds[0])
      commit(CompMutations.STATS_LOADING, false)
      return engineStatsByMemberIds
    },
    [CompActions.GET_PERIODS]: async ({ dispatch, commit, state }, input) => {
      const { data: { engineStatsPeriodsByMemberId } } = await apolloHexlyClient.mutate({
        mutation: ENGINE_STATS_PERIODS_QUERY,
        variables: { input }
      })
      const periods = _.groupBy(engineStatsPeriodsByMemberId, 'status')
      if (_.isEmpty(state.selectedPeriod)) {
        await dispatch(CompActions.SELECT_PERIOD, periods.open[0])
      }
      commit(CompMutations.SET_PERIODS, periods)
      return periods
    },
    [CompActions.SELECT_PERIOD]: async ({ dispatch, commit, rootState }, period) => {
      await dispatch(CompActions.GET_STATS, { forDate: period.open, membersIn: [rootState.user.principal.memberId] })
      commit(CompMutations.SET_SELECTED_PERIOD, period)
    }
  },
  getters: {}
}
