<template>
  <v-card id="rank-card" width="100%" :class="tabMode ? 'elevation-0 item-container-card' : null">
    <v-toolbar v-if="!tabMode" color="secondary" dark>
      <v-toolbar-title>Rank Requirements</v-toolbar-title>
      <v-spacer></v-spacer>
      <PeriodSwitcher v-if="!loading"></PeriodSwitcher>
      <template v-if="$tenantInfo.features.dashboard && $tenantInfo.features.dashboard.payoutHistory">
        <v-btn :disabled="stats && !stats.earnings" v-if="!showPayouts" icon small @click="showPayouts = !showPayouts">
          <v-icon>mdi-currency-usd</v-icon>
        </v-btn>
        <v-btn icon small v-else @click="showPayouts = !showPayouts">
          <v-icon>mdi-chart-gantt</v-icon>
        </v-btn>
      </template>
    </v-toolbar>
    <template v-if="showStatsMaintenance">
      <v-card-text>
        <v-alert class="inner-alert" icon="mdi-calendar-check" text dense type="info">
          {{
            selectedPeriod.metadata.engineMaintenanceMessage
            ||
            'Our system is currently undergoing maintenance. We will be back up shortly'
          }}
        </v-alert>
        <div class="title text-center">Realtime Stats Temporarily Unavailable</div>
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
          <EngineEarningCard :earnings="stats.earnings" />
        </template>
        <template v-else>
          <div class="text-center">
            <div class="subtitle-1"> {{selectedPeriod.name}} Rank </div>
            <v-progress-circular
              :rotate="90"
              :size="100"
              :width="15"
              :value="(rank/12)*100"
              color="primary"
            >
              <strong>{{ currentRank }}</strong>
            </v-progress-circular>
            <div class="caption"> Next Rank: <b class="black--text">{{nextRank}}</b></div>
          </div>
          <template class="stats-container py-4" v-if="stats">
            <v-layout justify-space-between>
              <v-flex>
                <div class="title">Influencer Bonus Tracker</div>
                <small>Points reflect current standing and might change by end of month.</small>
              </v-flex>
            </v-layout>
            <v-row no-gutters>
              <v-col v-for="b in influencerBonus" :key="b.tooltip" class="pa-1" cols="3" md="2" justify="center" align="center">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-progress-linear :value="calcProgress(stats.stats.psv, b)" :color="stats.stats.psv > b.top ? 'amber accent-2' : 'amber'" height="45" v-on="on" class="text-center">
                      <template v-slot:default>
                        <strong>{{ b.top }}+ psv</strong>
                      </template>
                    </v-progress-linear>
                  </template>
                  <span>{{b.tooltip}}</span>
                </v-tooltip>
              </v-col>
            </v-row>
          </template>
          <template class="stats-container px-2 py-4" v-if="stats">
            <v-row :class="{ 'rank-data-row' : tabMode, 'py-1': !tabMode }" justify="space-between" wrap v-for="(stat, i) in stats.metadata.requirements" :key="i">
              <v-layout justify-space-between>
                <v-flex>
                  <div class="title">
                    {{ stat.category ? stat.category.toUpperCase() : statsMapping[`${stat.type}_${stat.metric}`]}}
                  </div>
                </v-flex>
                <v-flex class="text-right">
                  <v-icon color="grey" v-if="stat.notApplicable">do_not_disturb</v-icon>
                  <v-icon color="grey" v-if="!stat.notApplicable && !stat.achieved">pending</v-icon>
                  <v-icon color="green lighten-2" v-if="!stat.notApplicable && stat.achieved">check_circle</v-icon>
                </v-flex>
              </v-layout>
              <v-col cols="12" class="pa-1">
                <v-progress-linear
                  rounded
                  :class="tabMode ? 'progress-bar' : null"
                  :color="stat.notApplicable ? 'grey' : 'green lighten-2'"
                  :height="25"
                  :value="Math.round(stat.earned/stat.required*100)">
                  <template v-slot:default>
                    <template v-if="!stat.notApplicable">
                      <template v-if="stat.achieved">
                        <strong> 100% </strong>
                      </template>
                      <template v-else>
                        <strong> {{format((stat.earned / stat.required) * 100)}}% </strong>
                      </template>
                    </template>
                    <template v-else>
                      <strong> Not Applicable for {{nextRank}} </strong>
                    </template>
                  </template>
                </v-progress-linear>
              </v-col>
              <v-layout justify-space-between v-if="!stat.notApplicable">
                <v-flex class="text-left">
                  <template v-if="stat.required && parseInt(stat.required)">
                    <strong class="subtitle-1 black--text">{{format(stat.earned)}}</strong> <small>/ {{format(stat.required)}}</small>
                  </template>
                </v-flex>
                <v-flex class="text-right">
                  <template>
                    <small v-if="stat.delta > 0" >You are over by <span class="black--text">{{format(stat.delta)}}</span> points!</small>
                    <small v-else-if="stat.delta < 0">You still need <span class="black--text">{{format(stat.delta)}}</span> points!</small>
                  </template>
                </v-flex>
              </v-layout>
              <v-layout justify-space-between v-else>
                <v-flex class="text-left">
                  <strong  class="subtitle-1 black--text">{{ format(stat.earned) }}</strong>
                </v-flex>
              </v-layout>
            </v-row>
          </template>
        </template>
      </v-card-text>
      <v-card-text v-else-if="(!statsDisabled && !loading) || !stats" class="pa-3">
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
import { intersection } from 'lodash'
import * as moment from 'moment'
import { mapState, mapGetters } from 'vuex'
import PeriodSwitcher from '@/components/PeriodSwitcher.vue'
import EngineEarningCard from '@/components/EngineEarningCard.vue'
export default {
  name: 'CompRanksCard',
  components: {
    PeriodSwitcher,
    EngineEarningCard
  },
  props: {
    stats: Object,
    statsDisabled: Boolean,
    tabMode: Boolean,
    loading: Boolean
  },
  data() {
    return {
      influencerBonus: [
        { bottom: 0, top: 250, tooltip: 'Earn Product Credit' },
        { bottom: 251, top: 500, tooltip: 'Earn an extra 5%' },
        { bottom: 501, top: 750, tooltip: 'Earn an extra 7.5%' },
        { bottom: 751, top: 1000, tooltip: 'Earn an extra 10%' },
        { bottom: 1001, top: 1250, tooltip: 'Earn an extra 12.5%' },
        { bottom: 1251, top: 1500, tooltip: 'Earn an extra 15%' },
        { bottom: 1501, top: 1750, tooltip: 'Earn an extra 17.5 %' },
        { bottom: 1751, top: 2000, tooltip: 'Earn an extra 20%' },
        { bottom: 2001, top: 2500, tooltip: 'Earn an extra 22.5%' },
        { bottom: 2501, top: 3000, tooltip: 'Earn an extra 25%' }
      ],
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
    calcProgress(psv, bonus) {
      if (psv >= bonus.bottom && psv < bonus.top) {
        return (psv / bonus.top) * 100
      } else if (psv >= bonus.top) {
        return 100
      }
      return 0
    },
    format(num) {
      num = Math.abs(num).toFixed(1)
      num = new Intl.NumberFormat('en-US', {}).format(num)
      return num
    },
    parseStats(stats) {
      if (stats && stats.metadata) {
        this.rank = stats.metadata.ranking.rank
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
        this.bannerMessage = `Hey there, you're looking at requirements for a new month. To check previous months select the three dot icon and choose a past month.`
        return true
      } else if (status === 'under_review') {
        this.bannerMessage = `This period is still under review. Month-end commissions will be paid out by the 15th of the month.`
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
      const maintenanceIsOn = this.selectedPeriod.metadata.engineMaintenance
      const isImpersonationAllowed = this.selectedPeriod.metadata.allowImpersonation && this.user.isImpersonating
      const hasAllowedTags = intersection(this.selectedPeriod.metadata.allowTags, this.member.tags)
      const canSkip = isImpersonationAllowed || hasAllowedTags.length > 0
      return (maintenanceIsOn && !canSkip)
    },
    ...mapGetters(['member']),
    ...mapState({
      user: state => state.user,
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
