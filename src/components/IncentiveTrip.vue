<template>
  <v-card color="purple" class="white--text">
    <v-card-title primary-title>
      <div class="full">
        <span v-if="!loading" class="display-2">
          <span v-if="!loading" class="display-2">{{totalPoints}}/{{maxPoints}}</span>
          <p class="subheading">ZEN On The High Seas</p>
            <v-progress-linear :value="percentComplete" height="25" color="success"></v-progress-linear>
          </span>
        <span v-if="loading" class="display-2">
          <v-progress-circular indeterminate :size="30" :width="3" color="white"></v-progress-circular>
        </span>
      </div>
    </v-card-title>
  </v-card>
</template>

<script>
import TEAM_STATS from '@/graphql/TeamStatSummaryByDepth.gql'
// ** WARNING **
// THIS IS A HARDCODED HACK! THIS IS NOT HOW WE WANT TO HANDLE INCENTIVE TRIPS
// ** WARNING **
export default {
  name: 'GreenHorizenTrip',
  data() {
    return {
      maxPoints: 50000,
      totalPoints: 0,
      percentComplete: 0,
      loading: true
    }
  },
  apollo: {
    totalPoints: {
      query: TEAM_STATS,
      variables() {
        return {
          rangeInput: {
            sellerId: this.$store.state.user.principal.member.id,
            tenantId: process.env.VUE_APP_TENANT_ID,
            startDate: '2018-06-01',
            endDate: '2018-10-31',
            targetDepth: 4
          }
        }
      },
      update({ teamStatSummaryByDepth }) {
        this.loading = false
        this.percentComplete =
          teamStatSummaryByDepth.totalPoints / this.maxPoints * 100
        return teamStatSummaryByDepth.totalPoints
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
v-card {
  overflow: hidden;
}
.full {
  width: 100%;
}
</style>
