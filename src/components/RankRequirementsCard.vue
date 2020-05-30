<template>
  <v-card id="rank-card" width="100%" :class="tabMode ? 'elevation-0 item-container-card' : null">
    <v-toolbar v-if="!tabMode" color="secondary" dark>
        <v-toolbar-title>Rank Requirements</v-toolbar-title>
        <v-spacer></v-spacer>
        <PeriodSwitcher v-if="!loading"></PeriodSwitcher>
        <!-- <v-btn icon small v-if="!showPayouts" :disabled="!stats.payouts || !stats.payouts.grandTotal" @click="showPayouts = !showPayouts">
          <v-icon>mdi-currency-usd</v-icon>
        </v-btn>
        <v-btn icon small v-else  @click="showPayouts = !showPayouts">
          <v-icon>mdi-chart-gantt</v-icon>
        </v-btn> -->
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
          <PeriodPayouts :payouts="stats.payouts" />
        </template>
        <template v-else>
          <v-row justify-space-between :class="tabMode ? 'rank-row' : ''" class="pa-1">
            <v-col class="pa-0">
              <div v-if="!currentRank" class="title">Unranked</div>
              <div v-else class="title">Rank {{currentRank}}</div>
              <div class="caption grey--text darken-1"> Current Rank </div>
            </v-col>
            <v-spacer></v-spacer>
            <v-col class="text-right pa-1" v-if="nextRank">
              <div class="title">Rank {{nextRank}}</div>
              <div class="caption grey--text darken-1"> Next Rank </div>
            </v-col>
          </v-row>

          <template class="stats-container pa-2" v-if="current">
            <v-row :class="tabMode ? 'rank-data-row' : null" justify="space-between" wrap v-for="stat in Object.keys(statMapping)" :key="stat.property">
              <template v-if="stat === 'anyRankCount' && Object.keys(next[stat].required).length === 0 "></template>
              <template v-else>
              <v-col class="pa-1">
                <div v-if="!tabMode" :class="( next[stat].required  ? '' : 'grey--text') + ' title'">
                  {{statMapping[stat].title}}
                  <template v-if="stat !== 'anyRankCount'">
                    <v-icon color="green" v-if="next[stat].satisfied && next[stat].required">check_circle</v-icon>
                  </template>
                  <template v-else>
                    <v-icon color="green" v-if="next[stat].satisfied && Object.keys(next[stat].required).length">check_circle</v-icon>
                  </template>
                </div>
                <div class="caption grey--text darken-1"> {{statMapping[stat].description}} </div>
              </v-col>
              <v-spacer></v-spacer>
              <v-col class="text-right pa-1" v-if="stat !== 'anyRankCount'">
                <div class="title">{{next[stat].earned}}</div>
                <div v-if="next[stat].required && parseInt(next[stat].earned)" class="caption grey--text darken-1">
                  {{Math.round(next[stat].earned/next[stat].required*100)}}%
                  <br>
                  <span v-if="!tabMode">{{Math.round(next[stat].earned)}} of {{Math.round(next[stat].required)}}</span>
                </div>
                <div v-else class="caption grey--text darken-1">
                  N/A
                  <br>
                  <span v-if="!tabMode">
                    {{ Math.round(next[stat].required)}}
                    <v-tooltip slot="append" left>
                      <template v-slot:activator="{ on }">
                        <v-icon v-on="on" small>info</v-icon>
                      </template>
                        <span>Not applicable for next rank</span>
                    </v-tooltip>
                  </span>
                </div>
              </v-col>
              <v-col class="pa-1 text-right" v-else>
                <template v-if="next[stat].satisfied">
                  <div class="title" >Achieved</div>
                  <div class="caption grey--text darken-1"> 100% </div>
                </template>
                <template v-else>
                  <div class="title">Unachieved</div>
                  <div class="caption grey--text darken-1"> 0% </div>
                </template>
              </v-col>
              <v-col cols="12" class="pa-1" v-if="stat !== 'anyRankCount'">
                <v-progress-linear :class="tabMode ? 'progress-bar' : null" :color="next[stat].required ? 'success' : 'grey' " :height="tabMode ? 2 : 5" :value="Math.round(next[stat].earned/next[stat].required*100)"></v-progress-linear>
              </v-col>
              </template>
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
import { mapState } from 'vuex'
import PeriodSwitcher from '@/components/PeriodSwitcher.vue'
import PeriodPayouts from '@/components/PeriodPayouts.vue'

export default {
  name: 'RankRequirementsCard',
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
      statMapping: {
        lifetimeTotalPoints: {
          title: 'CPSV',
          description: 'Career Personal Sales Volume'
        },
        personalTotalPoints: {
          title: 'PSV',
          description: 'Personal Sales Volume'
        },
        groupPoints: {
          title: 'GSV',
          description: 'Group Sales Volume'
        },
        activeLeg: {
          title: 'Active Legs',
          description: 'Active Legs'
        },
        downlinePoints: {
          title: 'DSV',
          description: 'Downline Sales volume'
        },
        anyRankCount: {
          title: 'PABQL',
          description: 'Paid-As Bonus Qualified Legs'
        },
        downlineAdjustedPoints: {
          title: 'ADSV',
          description: 'Adjusted Downline Sales volume'
        }
      }
    }
  },
  methods: {
    parseStats(stats) {
      const { current, next } = stats
      this.currentRank = current.rank
      this.nextRank = next.rank
      this.current = current.metrics.reduce((carry, stat) => {
        carry[stat.prop] = stat
        return carry
      }, {})

      this.next = next.metrics.reduce((carry, stat) => {
        carry[stat.prop] = stat
        return carry
      }, {})
    },
    showBanner() {
      if (this.tabMode) {
        return false
      } else if (this.selectedPeriod.status === 'open' &&
          this.periods.under_review &&
          this.periods.under_review.length) {
        this.bannerMessage = `Hey There, you're looking at requirements for a new month. To check previous months select the three dot icon and choose a past month.`
        return true
      } else if (this.selectedPeriod.status === 'under_review') {
        this.bannerMessage = `This period is still under review.`
        return true
      } else if (this.selectedPeriod.status === 'closed') {
        this.bannerMessage = `You are currently viewing a past period. This period is closed`
        return true
      }
      return false
    }
  },
  mounted() {
    if (this.stats && this.stats.current) {
      this.parseStats(this.stats)
    }
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
      if (newVal && newVal.current) {
        this.parseStats(newVal)
      }
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
