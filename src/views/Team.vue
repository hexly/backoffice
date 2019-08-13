<template>
  <v-flex xs12>
    <div class="team py-4">
      <v-layout row wrap justify-space-between>
        <v-flex xs12 sm6>
          <h1 :target="currentId">Team</h1>
        </v-flex>
        <v-flex xs12 sm3 md2>
          <month-selector
            :year="year"
            :month="month"
            :minDate="minDate"
            @date-changed="dateChanged"
          />
        </v-flex>
      </v-layout>
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
            <template v-for="(i, index) in results.team">
              <v-flex xs12 sm6 md4 v-if="statsMap[i.id]" :key="index">
                <TeamCard
                  :loading="loading"
                  @viewTeam="showTeam"
                  :user="i"
                  :actions="true"
                  :stats="statsMap[i.id]"
                  noData="No data available"
                />
              </v-flex>
            </template>
          </v-layout>
        </div>
      </div>
    </div>
  </v-flex>
</template>

<script>
import MonthSelector from '@/components/MonthSelector.vue'
import TeamCard from '../components/TeamCard.vue'
import getTeamByMemberId from '@/graphql/GetTeam'
import MONTHLY_STATS_QUERY from '@/graphql/GetMonthlyStats.gql'
import { Mutations } from '@/store'
import { mapMutations, mapState } from 'vuex'

const tenantId = ~~process.env.VUE_APP_TENANT_ID

export default {
  name: 'Team',
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
      statsMap: {}
    }
  },
  computed: {
    ...mapState({
      loading: state => state.loading
    })
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
    }
  },
  apollo: {
    results: getTeamByMemberId('currentId', function (isLoading, countModifier) {
      this.setLoading(isLoading)
    }),
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
        this.setLoading(isLoading)
      }
    }
  },
  mounted () {
    const { principal: member } = this.$store.state.user
    this.currentId = member.memberId
    this.lineage.push({ memberId: this.currentId, displayName: member.displayName })
  }
}
</script>

<style>
.team {
  max-width: 1440px;
  margin: auto;
  padding: 0 25px;
}
</style>
