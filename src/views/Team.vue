<template>
  <v-flex xs12>
    <div class="team">
      <h1 v-bind:target="currentId">Team</h1>
      <month-selector
        :year="year"
        :month="month"
        :minDate="minDate"
        @date-changed="dateChanged"
      />
      <div>
        <v-layout
          v-if="results.target"
          row
          wrap
          justify-center
        >
          <TeamCard
            :loading="$apollo.queries.stats.loading"
            @viewTeam="showTeam"
            :user="results.target"
            :stats="getStats(results.target)"
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
        <div v-if="!$apollo.queries.results.loading">
          <v-layout
            row
            wrap
          >
            <v-flex
              lg4
              v-for="(i, index) in results.team"
              :key="index"
            >
              <TeamCard
                :loading="$apollo.queries.stats.loading"
                @viewTeam="showTeam"
                :user="i"
                :actions="true"
                :stats="getStats(i)"
              />
            </v-flex>
          </v-layout>
        </div>
        <div v-if="$apollo.queries.results.loading">
          <v-progress-circular
            indeterminate
            :size="70"
            :width="7"
            color="black"
          ></v-progress-circular>
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
import find from 'rambda/lib/find'
import defaultTo from 'rambda/lib/defaultTo'

const tenantId = ~~process.env.VUE_APP_TENANT_ID

export default {
  name: 'Team',
  data: () => ({
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
    stats: []
  }),
  components: {
    TeamCard,
    MonthSelector
  },
  methods: {
    showTeam (user) {
      this.lineage.push(user)
      this.currentId = user.id || user.memberId
    },
    updateLineage (user, index) {
      this.lineage = this.lineage.slice(0, index + 1)
      this.currentId = user.memberId || user.id
    },
    getStats (target) {
      return defaultTo(
        {},
        find(_ => _.sellerId === target.id, this.stats)
      )
    },
    dateChanged ({ date }) {
      const dateSplit = date.split('-')
      this.month = parseInt(dateSplit[1])
      this.year = parseInt(dateSplit[0])
    }
  },
  apollo: {
    results: getTeamByMemberId('currentId'),
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
        console.log({ targetStats })
        if (targetStats.nodes.length > 0) {
          this.minDate = targetStats.nodes[0].joinedOn
        }
        const result = targetStats.nodes.concat(firstLevelStats.nodes)
        return result
      },
      fetchPolicy: 'cache-and-network'
    }
  },
  mounted () {
    const { principal: member } = this.$store.state.user
    this.currentId = member.memberId
    this.lineage.push({ memberId: this.currentId, displayName: member.displayName })
  }
}
</script>
