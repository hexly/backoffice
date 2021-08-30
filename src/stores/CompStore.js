import _ from 'lodash'
import moment from 'moment'
import { apolloHexlyClient, apolloFederatedClient } from '@/vue-apollo'
import { getCompStats, parseData, getEngineStats, formatData } from '@/graphql/comp.gql'

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
  SET_PREVIOUS_STATS: 'compSetPreviousStats',
  SET_HAS_MORE_PERIODS: 'compHasMorePeriods'
}

export const CompStore = {
  state: {
    engineStatsLoading: true,
    stats: {},
    periods: {},
    selectedPeriod: {},
    currentPeriod: {},
    previousPeriod: null,
    hasMorePeriods: false
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
      console.log({ periods })
      state.periods = periods
    },
    [CompMutations.SET_HAS_MORE_PERIODS]: (state, hasMore) => {
      state.hasMorePeriods = hasMore
    },
    [CompMutations.SET_SELECTED_PERIOD]: (state, selectedPeriod) => {
      state.selectedPeriod = selectedPeriod
    }
  },
  actions: {
    [CompActions.GET_STATS]: async ({ state, commit }, { input, version, transient, periodId }) => {
      commit(CompMutations.STATS_LOADING, true)
      if (version === 3) {
        const memberId = input.membersIn[0]
        const { data: { engine: { rankings: { results } } } } = await apolloFederatedClient.query(getEngineStats(
          {
            memberId,
            periodId
          }
        ))
        const stats = formatData(results[0])
        if (!transient) {
          commit(CompMutations.SET_STATS, { ...stats, id: periodId })
        }
        commit(CompMutations.STATS_LOADING, false)
        return [stats]
      } else if (version === 2) {
        const memberId = input.membersIn[0]
        const { data } = await apolloFederatedClient.query(getCompStats(
          {
            memberId,
            type: ['descendant'],
            periodId,
            memberIn: input.membersIn
          }
        ))
        const newComp = parseData(data)
        const memberStats = newComp.members.find(s => ~~s.awardeeId === memberId)
        if (!transient) {
          commit(CompMutations.SET_STATS, memberStats)
        }
        commit(CompMutations.STATS_LOADING, false)
        return newComp.members
      } else {
        const { data: { engineStatsByMemberIds } } = await apolloHexlyClient.query({
          query: ENGINE_STATS_QUERY,
          fetchPolicy: 'network-only',
          variables: { input }
        })
        if (!transient) {
          commit(CompMutations.SET_STATS, engineStatsByMemberIds[0])
        }
        commit(CompMutations.STATS_LOADING, false)
        return engineStatsByMemberIds
      }
    },
    [CompActions.GET_PERIODS]: async ({ dispatch, commit, state, rootState }, input) => {
      const response = await apolloFederatedClient.query({
        query: ENGINE_STATS_PERIODS_QUERY,
        variables: input
      })
      const engineStatsPeriodsByMemberId = _.get(response, 'data.engine.periods.results')
      const filteredPeriods = engineStatsPeriodsByMemberId.slice(0, 6).map(p => {
        return {
          ...p,
          status: p.status.toLowerCase()
        }
      })
      commit(CompMutations.SET_HAS_MORE_PERIODS, filteredPeriods.length < engineStatsPeriodsByMemberId.length)
      const periods = _.groupBy(filteredPeriods, 'status')
      const currentPeriod = periods.open[0]
      if (_.isEmpty(state.selectedPeriod)) {
        await dispatch(CompActions.SELECT_PERIOD, currentPeriod)
      }
      if (_.isEmpty(state.previousPeriod) && (periods.closed || periods.under_review)) {
        const currentPeriodOpen = moment(currentPeriod.open, 'YYYY-MM-DD')
        const pastPeriod = engineStatsPeriodsByMemberId.find(p => p.close === currentPeriodOpen.format('YYYY-MM-DD'))
        const [previous] = await dispatch(CompActions.GET_STATS, {
          input: {
            forDate: currentPeriodOpen.subtract(1, 'day').format('YYYY-MM-DD'),
            membersIn: [rootState.user.principal.memberId]
          },
          version: _.get(pastPeriod, 'metadata.version', 1),
          periodId: pastPeriod.id,
          transient: true
        })
        if (previous && (previous.memberId || previous.awardeeId)) {
          commit(CompMutations.SET_PREVIOUS_STATS, previous)
        }
      }
      commit(CompMutations.SET_PERIODS, periods)
      return periods
    },
    [CompActions.SELECT_PERIOD]: async ({ dispatch, commit, rootState }, period) => {
      commit(CompMutations.SET_SELECTED_PERIOD, period)
      await dispatch(CompActions.GET_STATS, {
        input: { forDate: period.open, membersIn: [rootState.user.principal.memberId] },
        version: _.get(period, 'metadata.version', 1),
        periodId: period.id
      })
    }
  },
  getters: {
    isSelectedCurrent: state => {
      if (!state.currentPeriod) {
        return false
      }
      return ~~state.selectedPeriod.id === ~~state.currentPeriod.periodId
    },
    isMonthInReview: state => {
      return !!(state.periods.under_review && state.periods.under_review.length)
    }
  }
}
