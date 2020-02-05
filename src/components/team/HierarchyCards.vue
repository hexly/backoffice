<template>
  <div class="team py-4">
    <div>
      <v-layout
        v-if="results.target"
        row
        wrap
        justify-center
      >
        <TeamCard
          :loading="loading"
          @viewTeam="showTeam"
          :user="results.target"
          :stats="statsMap[results.target.id]"
        />
      </v-layout>
      <v-breadcrumbs divider="/">
        <v-breadcrumbs-item
          v-for="(user, index) in lineage"
          :key="user.contactEmail"
          :disabled="index === (lineage.length - 1)"
        >
          <span @click="updateLineage(user, index)">{{user.displayName}}</span>
        </v-breadcrumbs-item>
      </v-breadcrumbs>
      <div v-if="!loading">
        <v-layout row wrap>
          <template v-for="(i, index) in mergedTeamArr">
            <v-flex xs12 sm4 md3 :key="index">
              <TeamCard
                :loading="loading"
                @viewTeam="showTeam"
                :user="i"
                :actions="true"
                :stats="statsMap[i.id]"
                :compStats="compStats[teamIds.indexOf(i.id)]"
                noData="No data available"
              />
            </v-flex>
          </template>
        </v-layout>
      </div>
      <div class="loading-container" v-else>
        <v-progress-circular indeterminate/>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapMutations, mapState, mapGetters } from 'vuex'

import MonthSelector from '@/components/MonthSelector.vue'
import TeamCard from '@/components/TeamCard.vue'
import { TEAM_QUERY, TEAM_SEARCH_QUERY } from '@/graphql/Team.gql'
import MONTHLY_STATS_QUERY from '@/graphql/GetMonthlyStats.gql'
import { COMP_STATS_QUERY } from '@/graphql/CompStats.gql'
import { Mutations } from '@/store'

const tenantId = ~~process.env.VUE_APP_TENANT_ID

export default {
  name: 'HierarchyCards',
  data() {
    return {
      root: {},
      lineage: [],
      currentId: undefined,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      minDate: null,
      results: {
        target: undefined,
        team: []
      },
      stats: [],
      statsMap: {},
      mergedTeamArr: [],
      hashResTeam: [],
      teamIds: []
    }
  },
  computed: {
    ...mapState({
      loading: state => state.loading
    }),
    ...mapGetters(['member'])
  },
  components: {
    TeamCard,
    MonthSelector
  },
  methods: {
    ...mapMutations([ Mutations.SET_LOADING ]),
    showTeam (user) {
      this.lineage.push(user)
      this.currentId = user.id || user.memberId
    },
    updateLineage (user, index) {
      this.lineage = this.lineage.slice(0, index + 1)
      this.currentId = user.memberId || user.id
    },
    dateChanged ({ date }) {
      const dateSplit = date.split('-')
      this.month = parseInt(dateSplit[1])
      this.year = parseInt(dateSplit[0])
    },
    hashResultsTeam(results, memberTeamSearch) {
      let matchArr = []

      if (!memberTeamSearch || !results) {
        return
      }

      results.team.forEach(member => {
        const matchIndex = memberTeamSearch.team.findIndex(element => member.id === element.id)
        matchArr.push(matchIndex)
      })

      this.hashResTeam = matchArr

      this.mergeUserTeam()
    },
    mergeUserTeam() {
      let mergedArr = []
      const { results: { team: resTeam }, memberTeamSearch: { team: mtsTeam }, hashResTeam } = this
      if (!hashResTeam || !hashResTeam.length || !resTeam) {
        this.mergedTeamArr = resTeam
        return
      }

      resTeam.forEach((resObject, index) => {
        let newResObj = { ...resObject }
        const mtsObject = mtsTeam[hashResTeam[index]]
        if (!mtsObject) {
          mergedArr.push(newResObj)
          return
        }
        const mtsObjectKeys = Object.keys(mtsObject)

        mtsObjectKeys.forEach(mtsKey => {
          const resObjHasProp = resObject.hasOwnProperty(mtsKey)

          if (!resObjHasProp) {
            newResObj[mtsKey] = mtsObject[mtsKey]
          }
        })
        mergedArr.push(newResObj)
      })
      this.mergedTeamArr = mergedArr
    }
  },
  apollo: {
    results: {
      query: TEAM_QUERY,
      variables() {
        const id = this.currentId || _.get(this, '$store.state.user.principal.memberId') // WTF check this state
        return {
          byTarget: { ids: [id] }, // get me the target
          bySponsor: { sponsorIds: [id] } // get me anyone who belongs to the target
        }
      },
      update ({ target, team }) {
        if (team.nodes && team.nodes.length) {
          this.teamIds = team.nodes.map(t => t.id)
        }
        return {
          target: target.nodes[0],
          team: team.nodes
        }
      }
    },
    memberTeamSearch: {
      query: TEAM_SEARCH_QUERY,
      variables() {
        return {
          input: {
            MemberId: this.currentId,
            query: null,
            orderDirection: 'asc',
            orderByColumn: 'depth',
            limit: 500,
            offset: 0
          }
        }
      },
      watchLoading(isLoading, countModifier) {
        // this.setLoading(isLoading || this.$apollo.loading)
      },
      loadingKey: 'loading',
      debounce: 500
    },
    stats: {
      query: MONTHLY_STATS_QUERY,
      variables () {
        return {
          targetCondition: {
            tenantId,
            sellerId: this.currentId,
            month: this.month,
            year: this.year
          },
          firstLevelCondition: {
            tenantId,
            sponsorId: this.currentId,
            month: this.month,
            year: this.year
          }
        }
      },
      update ({ targetStats, firstLevelStats }) {
        if (targetStats.nodes.length > 0) {
          this.minDate = targetStats.nodes[0].joinedOn
        }
        const result = targetStats.nodes.concat(firstLevelStats.nodes)
        this.statsMap = {}
        result.forEach(r => {
          this.statsMap[r.sellerId] = r
        })
        return result
      },
      fetchPolicy: 'cache-and-network',
      watchLoading(isLoading, countModifier) {
        // this.setLoading(isLoading || this.$apollo.loading)
      }
    },
    compStats: {
      query: COMP_STATS_QUERY,
      variables() {
        return {
          input: {
            year: this.year,
            month: this.month,
            membersIn: this.teamIds
          }
        }
      },
      update({ compStatsQuery: { results } }) {
        return results
      }
    }
  },
  mounted () {
    this.currentId = this.member.memberId || this.member.id
    this.lineage.push({ memberId: this.currentId, displayName: this.member.displayName })
  },
  watch: {
    results(newVal) {
      const { memberTeamSearch } = this

      this.hashResultsTeam(newVal, memberTeamSearch)
    },
    memberTeamSearch(newVal) {
      const { results } = this

      this.hashResultsTeam(results, newVal)
    },
    '$apollo.loading' (newVal) {
      this.setLoading(newVal)
    }
  }
}
</script>

<style>
.team {
  max-width: 1440px;
  margin: auto;
  padding: 0 25px;
}
.loading-container {
  display: flex;
  justify-content: center;
}
</style>
