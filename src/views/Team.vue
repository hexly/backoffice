<template>
  <v-flex xs12>
    <div class="team">
      <h1 v-bind:target="currentId">Team</h1>
      <date-selector :year="year" :month="month" @date-changed="dateChanged"/>
      <div>
        <v-layout v-if="results.target" row wrap justify-center>
          <TeamCard :loading="$apollo.queries.stats.loading" @viewTeam="showTeam" :user="results.target" :stats="getStats(results.target)"/>
        </v-layout>
        <v-breadcrumbs divider="/">
            <v-breadcrumbs-item
              v-for="(user, index) in lineage"
              :key="user.email"
              :disabled="index === (lineage.length - 1)"
            >
              <span @click="updateLineage(user, index)">{{user.displayName}}</span>
            </v-breadcrumbs-item>
          </v-breadcrumbs>
        <div  v-if="!$apollo.queries.results.loading">
          <v-layout row wrap>
            <v-flex lg4 v-for="i in results.team" :key="i.email">
              <TeamCard :loading="$apollo.queries.stats.loading" @viewTeam="showTeam" :user="i" :actions="true" :stats="getStats(i)"/>
            </v-flex>
          </v-layout>
        </div>
        <div v-if="$apollo.queries.results.loading">
          <v-progress-circular indeterminate :size="70" :width="7" color="black"></v-progress-circular>
        </div>
      </div>
    </div>
  </v-flex>
</template>

<script>
import DateSelector from '@/components/DateSelector.vue'
import TeamCard from '../components/TeamCard.vue'
import getTeamByMemberId from '@/graphql/GetTeam'
import MONTHLY_STATS_QUERY from '@/graphql/GetMonthlyStats.gql'
import find from 'rambda/lib/find'
import defaultTo from 'rambda/lib/defaultTo'

export default {
  name: 'Team',
  data: () => ({
    root: {},
    lineage: [],
    currentId: undefined,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    results: {
      target: undefined,
      team: []
    },
    stats: []
  }),
  components: {
    TeamCard,
    DateSelector
  },
  methods: {
    showTeam(user) {
      this.lineage.push(user)
      this.currentId = user.memberId
    },
    updateLineage(user, index) {
      this.lineage = this.lineage.slice(0, index + 1)
      this.currentId = user.memberId
    },
    getStats(target) {
      return defaultTo(
        {},
        find(_ => _.sellerId === target.memberId, this.stats)
      )
    },
    dateChanged({ dateType, date }) {
      this[dateType] = date
    }
  },
  apollo: {
    results: getTeamByMemberId('currentId'),
    stats: {
      query: MONTHLY_STATS_QUERY,
      variables() {
        return {
          targetCondition: {
            sellerId: this.currentId,
            month: this.month,
            year: this.year
          },
          firstLevelCondition: {
            sponsorId: this.currentId,
            month: this.month,
            year: this.year
          }
        }
      },
      update({ targetStats, firstLevelStats }) {
        return targetStats.nodes.concat(firstLevelStats.nodes)
      },
      fetchPolicy: 'cache-and-network'
    }
  },
  mounted() {
    const { member } = this.$store.state.user.principal
    this.currentId = member.id
    this.lineage.push({ memberId: member.id, displayName: member.name })
  }
}
</script>
