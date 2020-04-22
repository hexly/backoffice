import _ from 'lodash'
import moment from 'moment'
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
  STATS_LOADING: 'compStatsLoading',
  SET_PREVIOUS_STATS: 'compSetPreviousStats'
}

export const CompStore = {
  state: {
    engineStatsLoading: true,
    stats: {},
    periods: {},
    selectedPeriod: {},
    currentPeriod: {},
    previousPeriod: null
  },
  mutations: {
    [CompMutations.SET_STATS]: (state, stats) => {
      state.stats = stats
      if (state.selectedPeriod.status === 'open') {
        state.currentPeriod = stats
      }
    },
    [CompMutations.SET_PREVIOUS_STATS]: (state, stats) => {
      state.previousPeriod = stats
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
    [CompActions.GET_STATS]: async ({ state, commit }, { input, transient }) => {
      commit(CompMutations.STATS_LOADING, true)
      const { data: { engineStatsByMemberIds } } = await apolloHexlyClient.query({
        query: ENGINE_STATS_QUERY,
        fetchPolicy: 'network-only',
        variables: { input }
      })
      console.log(engineStatsByMemberIds)
      if (!transient) {
        commit(CompMutations.SET_STATS, engineStatsByMemberIds[0])
      }
      commit(CompMutations.STATS_LOADING, false)
      return engineStatsByMemberIds
    },
    [CompActions.GET_PERIODS]: async ({ dispatch, commit, state, rootState }, input) => {
      const { data: { engineStatsPeriodsByMemberId } } = await apolloHexlyClient.query({
        query: ENGINE_STATS_PERIODS_QUERY,
        variables: { input }
      })
      const periods = _.groupBy(engineStatsPeriodsByMemberId, 'status')
      const currentPeriod = periods.open[0]
      if (_.isEmpty(state.selectedPeriod)) {
        await dispatch(CompActions.SELECT_PERIOD, currentPeriod)
      }
      if (_.isEmpty(state.previousPeriod)) {
        const previous = await dispatch(CompActions.GET_STATS, {
          input: {
            forDate: moment(currentPeriod.open, 'YYYY-MM-DDD').subtract(1, 'day').format('YYYY-MM-DD'),
            membersIn: [rootState.user.principal.memberId]
          },
          transient: true
        })
        commit(CompMutations.SET_PREVIOUS_STATS, previous[0])
      }
      commit(CompMutations.SET_PERIODS, periods)
      return periods
    },
    [CompActions.SELECT_PERIOD]: async ({ dispatch, commit, rootState }, period) => {
      commit(CompMutations.SET_SELECTED_PERIOD, period)
      await dispatch(CompActions.GET_STATS, { input: { forDate: period.open, membersIn: [rootState.user.principal.memberId] } })
    }
  },
  getters: {
    isSelectedCurrent: state => {
      return state.selectedPeriod.id === state.currentPeriod.periodId
    }
  }
}
