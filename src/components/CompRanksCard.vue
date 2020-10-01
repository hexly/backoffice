<template>
  <v-card id="rank-card" width="100%" :class="tabMode ? 'elevation-0 item-container-card' : null">
    <v-toolbar v-if="!tabMode" color="secondary" dark>
      <v-toolbar-title>Rank Requirements</v-toolbar-title>
      <v-spacer></v-spacer>
      <PeriodSwitcher v-if="!loading"></PeriodSwitcher>
      <template v-if="$tenantInfo.features.dashboard && $tenantInfo.features.dashboard.payoutHistory">
        <v-btn v-if="!showPayouts" icon small @click="showPayouts = !showPayouts">
          <v-icon>mdi-currency-usd</v-icon>
        </v-btn>
        <v-btn icon small v-else @click="showPayouts = !showPayouts">
          <v-icon>mdi-chart-gantt</v-icon>
        </v-btn>
      </template>
    </v-toolbar>
    <template v-if="showStatsMaintenance">
      <v-card-text>
        <v-alert
          class="inner-alert"
          icon="mdi-calendar-check"
          text
          dense
          type="info">
          Our system is currently undergoing maintenance. We will be back up shortly
        </v-alert>
      </v-card-text>
    </template>
    <template v-else>
      <v-card-text v-if="stats && Object.keys(stats).length && !statsDisabled && !loading">
        <v-alert
          class="inner-alert"
          :value="selectedPeriod && showBanner()"
          icon="mdi-calendar-check"
          text
          dense
          type="info">
          {{bannerMessage}}
        </v-alert>
        <template v-if="showPayouts">
          <!-- <PeriodPayouts :payouts="stats.payouts" /> -->
        </template>
        <template v-else>
          <v-row justify-space-between :class="tabMode ? 'rank-row' : ''" class="pa-1">
            <v-col class="pa-0">
              <div v-if="!currentRank" class="title">Unranked</div>
              <div v-else class="title">{{currentRank}}</div>
              <div class="caption grey--text darken-1"> Current Rank </div>
            </v-col>
            <v-spacer></v-spacer>
            <v-col class="text-right pa-1" v-if="nextRank">
              <div class="title">{{nextRank}}</div>
              <div class="caption grey--text darken-1"> Next Rank </div>
            </v-col>
          </v-row>

          <template class="stats-container px-2 py-4" v-if="stats">
            <v-row class="py-3" :class="tabMode ? 'rank-data-row' : null" justify="space-between" wrap v-for="(stat, i) in stats.metadata.requirements" :key="i">
              <v-col class="pa-1">
                <div class="title">
                  {{statsMapping[`${stat.type}_${stat.metric}`]}}
                  <v-icon color="green" v-if="stat.achieved">check_circle</v-icon>
                </div>
              </v-col>
              <v-spacer></v-spacer>
              <v-col class="pa-1 text-right">
                <div class="title">{{Math.floor(stat.earned)}}</div>
                <div v-if="stat.achieved && parseInt(stat.earned)" class="caption grey--text darken-1">
                  <span v-if="!tabMode">{{Math.round(stat.earned)}} of {{Math.round(stat.required)}}</span>
                </div>
                <template v-if="stat.achieved">
                  <div class="caption grey--text darken-1"> 100% </div>
                </template>
                <template v-else>
                  <div class="caption grey--text darken-1"> 0% </div>
                </template>
              </v-col>
              <v-col cols="12" class="pa-1">
                <v-progress-linear :class="tabMode ? 'progress-bar' : null" :color="'success'" :height="tabMode ? 2 : 5" :value="Math.round(stat.earned/stat.required*100)"></v-progress-linear>
              </v-col>
            </v-row>
          </template>
        </template>
      </v-card-text>
      <v-card-text v-else-if="!statsDisabled && !loading" class="pa-3">
        <v-layout row justify-space-between :class="tabMode ? null : 'pb-4'">
          <v-flex px-3>
            <div class="title text-center">No Rank Data Found</div>
          </v-flex>
        </v-layout>
      </v-card-text>
      <v-card-text v-else-if="statsDisabled && !loading" class="pa-3">
        <v-layout row justify-space-between pb-4>
          <v-flex px-3>
            <div class="title text-center">Realtime Stats Temporarily Unavailable</div>
          </v-flex>
        </v-layout>
      </v-card-text>
      <v-card-text v-else-if="loading" class="pa-3">
        <v-layout row justify-space-between pb-4>
          <v-flex id="loading-container" px-3>
            <v-progress-circular indeterminate />
          </v-flex>
        </v-layout>
      </v-card-text>
    </template>
  </v-card>
</template>

<script>
import * as moment from 'moment'
import { mapState } from 'vuex'
import PeriodSwitcher from '@/components/PeriodSwitcher.vue'
import PeriodPayouts from '@/components/PeriodPayouts.vue'
export default {
  name: 'CompRanksCard',
  components: {
    PeriodSwitcher,
    PeriodPayouts
  },
  props: {
    stats: Object,
    statsDisabled: Boolean,
    tabMode: Boolean,
    loading: Boolean
  },
  data() {
    return {
      showPayouts: false,
      bannerMessage: null,
      rank: null,
      current: null,
      next: null,
      nextRank: null,
      currentRank: null,
      nextRankReqs: {},
      nextRankSatisfied: {},
      currentProgress: {},
      year: ~~this.$moment().format('Y'),
      month: ~~this.$moment().format('M'),
      lastRefreshed: null,
      statsMapping: {
        personal_stat_downline: 'DSV',
        personal_stat_group: 'GSV',
        personal_stat_personal: 'PSV',
        career_stat_undefined: 'CPSV',
        adjusted_downline_volume_downline: 'ADSV'
      }
    }
  },
  methods: {
    parseStats(stats) {
      if (stats && stats.metadata) {
        console.log(stats)
        this.currentRank = stats.metadata.ranking.name
        this.nextRank = stats.metadata.nextRanking.name
      }
    },
    showBanner() {
      const { open, status } = this.selectedPeriod || {}
      const days = moment().diff(moment(open), 'days')
      if (this.tabMode) {
        return false
      } else if (status === 'open' &&
          // this.periods.under_review &&
          // this.periods.under_review.length) {
          days <= 5) {
        this.bannerMessage = `Hey There, you're looking at requirements for a new month. To check previous months select the three dot icon and choose a past month.`
        return true
      } else if (status === 'under_review') {
        this.bannerMessage = `This period is still under review.`
        return true
      } else if (status === 'closed') {
        this.bannerMessage = `You are currently viewing a past period. This period is closed`
        return true
      }
      return false
    }
  },
  mounted() {
    this.parseStats(this.stats)
  },
  computed: {
    showStatsMaintenance() {
      // all env vars come in as strings! yay!
      return process.env.VUE_APP_STATS_MAINTENANCE === 'true'
    },
    ...mapState({
      periods: state => state.comp.periods,
      selectedPeriod: state => state.comp.selectedPeriod
    })
  },
  watch: {
    stats(newVal) {
      this.parseStats(newVal)
    }
  }
}
</script>

<style scoped>
#rank-card {
  width: 100%;
  margin: auto;
}
.rank-tooltip span{
  display: flex;
  align-items: center;
}
#loading-container {
  justify-content: center;
  display: flex;
}
.item-container-card {
  min-height: 215px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}
.progress-bar {
  margin: 0;
  margin-bottom: 11px;
}
.stats-container {
  max-height: unset;
}
.rank-row {
  padding-bottom: 10px;
}
.inner-alert {
  margin: -15px -16px 6px -16px;
}
</style>
