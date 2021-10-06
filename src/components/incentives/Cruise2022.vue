<template>
  <v-card>
    <v-img src="/img/1010/Everra_Ready_BeautyBox.jpg" ></v-img>
    <v-card-text class="text-center pb-0">
      <div><span class="subheading font-weight-bold" style="color: rgb(153,203,213)">WHO: </span>Influencers from all markets who Qualify</div>
      <div><span class="subheading font-weight-bold" style="color: rgb(153,203,213)">Qualifying Period:</span> June 1 – October 31, 2021</div>
      <div>Incentive Trip Points (ITPs) required to qualify:</div>
      <div>
        Level 1: <b>15,000</b>
        <span style="color: rgb(153,203,213); font-size: 18px;"> /</span>
        Level 2: <b>20,000</b>
        <span style="color: rgb(153,203,213); font-size: 18px;"> /</span>
        Level 3: <b>25,000</b>
      </div>
      <a href="/docs/1010/Everra-I-am-ready-trip.pdf" target="_blank">View Details</a>
      <v-divider class="ma-3"></v-divider>
      <template v-if="engineStats && engineStats.awarded && !engineStatsLoading">
        <v-progress-linear
          rounded
          background-color="rgba(255,222,232,0.4)"
          color="rgb(153,203,213)"
          :height="25"
          :value="Math.round((tripPoints)/25000*100)">
          <template v-slot:default>
              <strong v-if="!showStatsMaintenance"> {{tripPoints}} / 25000</strong>
              <strong v-else> {{ openPeriod.metadata.engineMaintenanceMessage || 'Realtime Stats Temporarily Unavailable'}}</strong>
          </template>
        </v-progress-linear>
        <div v-if="tripPoints && !showStatsMaintenance">
          <v-expansion-panels flat>
            <v-expansion-panel>
              <v-expansion-panel-header>
                View Breakdown<sup>†</sup>
                <template v-slot:actions>
                  <v-icon color="primary">
                    $expand
                  </v-icon>
                </template>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <pie-chart :messages="{empty: 'No data'}" height="250px" :data="[
                  ['Previous Month', engineStats.awarded.it2022prev],
                  ['Current PSV', engineStats.awarded.it2022psv],
                  ['Current Rank', engineStats.awarded.it2022r],
                  ['Current Rank Advancement', engineStats.awarded.it2022nr],
                  ['Current Frontline Rank Advancement', engineStats.awarded.it2022rnr]
                ]"></pie-chart>
                <small><sup>†</sup>Points reflect current standing and might change by end of month.</small>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </template>
      <v-progress-linear v-else rounded background-color="rgb(255,222,232,0.4)" :height="25" indeterminate color="rgb(153,203,213)">
        <template v-slot:default>
          <strong>Loading</strong>
        </template>
      </v-progress-linear>
    </v-card-text>
    <v-card-title style="color: rgb(153,203,213)" class="pt-0 font-weight-bold">HOW TO EARN ITP</v-card-title>
    <v-card-text>
      <div class="trip-points-copy">
        <div><strong>Personal Sales Volume</strong>: 1 PSV = 1 ITP</div>
      </div>
      <div class="trip-points-copy">
        <v-row justify="space-around">
          <v-col cols="4">
            <h4 class="trip-points-header">Rank Achievments</h4>
          </v-col>
          <v-col cols="4">
            <h4 class="trip-points-header">Per Month Rank
              <v-menu open-on-hover top offset-y content-class="tooltip">
                <template v-slot:activator="{ on, attrs }">
                  <v-icon v-bind="attrs" v-on="on" small>mdi-help-circle-outline</v-icon>
                </template>
                <span>Earn ITPs every month a rank is reached. Only points for the specific rank are earned.</span>
              </v-menu>
            </h4>
          </v-col>
          <v-col cols="4">
            <h4 class="trip-points-header">Rank Advance
              <v-menu open-on-hover top offset-y content-class="tooltip">
                <template v-slot:activator="{ on, attrs }">
                  <v-icon v-bind="attrs" v-on="on" small>mdi-help-circle-outline</v-icon>
                </template>
                <span>Earn points for each new rank you achieve during the qualifying period.</span>
              </v-menu>
            </h4>
          </v-col>
          <v-col cols="4">
            <div v-for="i in 12" :key="`rank ${i}`">Rank {{i}}</div>
          </v-col>
          <v-col cols="4">
            <div class="font-weight-bold" v-for="i in 12" :key="`rank-month ${i}`">{{i * 100}} ITPs</div>
          </v-col>
          <v-col cols="4">
            <div v-for="i in 5" :key="`rank-blank ${i}`">--</div>
            <div class="font-weight-bold" v-for="i in 7" :key="`rank-adcance ${i}`">{{(i + 5) * 1000}} ITPs</div>
          </v-col>
        </v-row>
      </div>
      <h4 class="trip-points-header">Personally Sponsored Influencers</h4>
      <div class="trip-points-copy">
        <div>
          <span class="font-weight-bold">1K ITPs</span> per Personally Sponsored New Influencer<sup>*</sup> that advances to rank 2
        </div>
        <div>
          <span class="font-weight-bold">4K ITPs</span> per Personally Sponsored New Influencer<sup>*</sup> that advances to rank 4
        </div>
        <div>
          <small> <strong> <sup>*</sup> Personally Sponsored New Influencers</strong> are Influencers who join and qualify between June 1 - October 31, 2021. </small>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import * as _ from 'lodash'

export default {
  name: 'Cruise2022',
  computed: {
    tripPoints() {
      return _.get(this, 'engineStats.awarded.it2022total', 0) || 0
    },
    engineStats() {
      let s = this.stats
      if (_.isEmpty(this.stats.awarded)) {
        s = this.previous
      }
      return s
    },
    showStatsMaintenance() {
      if (this.openPeriod) {
        const maintenanceIsOn = this.openPeriod.metadata.engineMaintenance
        const isImpersonationAllowed = this.openPeriod.metadata.allowImpersonation && this.user.isImpersonating
        const hasAllowedTags = _.intersection(this.openPeriod.metadata.allowTags, this.member.tags)
        const canSkip = isImpersonationAllowed || hasAllowedTags.length > 0
        return (maintenanceIsOn && !canSkip)
      }
      return false
    },
    ...mapState({
      user: state => state.user,
      stats: state => state.comp.stats,
      engineStatsLoading: state => state.comp.engineStatsLoading,
      openPeriod: state => state.comp.periods.open && state.comp.periods.open[0],
      previous: state => state.comp.previousPeriod
    }),
    ...mapGetters(['contactId', 'memberId', 'member', 'slug', 'tenantIntegrations'])
  }

}
</script>

<style scoped>

</style>
