<template>
  <v-card>
    <v-img src="/img/1010/everra-trip.png" ></v-img>
    <v-card-text class="text-center">
      <div><span class="primary--text subheading font-weight-bold">WHERE: </span>Cruise (destination to be announced)</div>
      <div><span class="primary--text subheading font-weight-bold">WHEN: </span>1st Quarter 2022</div>
      <div><span class="primary--text subheading font-weight-bold">WHO: </span>Influencers from all markets who Qualify</div>
      <div>Qualifying Period: June 1 – October 31, 2021</div>
      <div>Incentive Trip Points (ITPs) required to qualify: <b>25,000</b></div>
      <v-divider class="ma-3"></v-divider>
      <template v-if="engineStats && engineStats.awarded">
        <v-progress-linear
          rounded
          color="rgb(195,163,194)"
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
                View Breakdown
                <template v-slot:actions>
                  <v-icon color="primary">
                    $expand
                  </v-icon>
                </template>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <template v-if="engineStats.awarded.it2022prev">
                  Previous Month
                  <v-progress-linear rounded color="blue" :height="25" :value="Math.round((engineStats.awarded.it2022prev)/tripPoints*100)">
                    <template v-slot:default>
                        <strong v-if="!showStatsMaintenance"> {{engineStats.awarded.it2022prev}} / {{tripPoints}}</strong>
                    </template>
                  </v-progress-linear>
                </template>
                <template v-if="engineStats.awarded.it2022psv">
                  Current PSV
                  <v-progress-linear rounded color="blue" :height="25" :value="Math.round((engineStats.awarded.it2022psv)/tripPoints*100)">
                    <template v-slot:default>
                        <strong v-if="!showStatsMaintenance"> {{engineStats.awarded.it2022psv}} / {{tripPoints}}</strong>
                    </template>
                  </v-progress-linear>
                </template>
                <template v-if="engineStats.awarded.it2022r">
                  Current Rank
                  <v-progress-linear rounded color="blue" :height="25" :value="Math.round((engineStats.awarded.it2022r)/tripPoints*100)">
                    <template v-slot:default>
                        <strong v-if="!showStatsMaintenance"> {{engineStats.awarded.it2022r}} / {{tripPoints}}</strong>
                    </template>
                  </v-progress-linear>
                </template>
                <template v-if="engineStats.awarded.it2022nr">
                  Current Rank Advancement
                  <v-progress-linear rounded color="blue" :height="25" :value="Math.round((engineStats.awarded.it2022nr)/tripPoints*100)">
                    <template v-slot:default>
                        <strong v-if="!showStatsMaintenance"> {{engineStats.awarded.it2022nr}} / {{tripPoints}}</strong>
                    </template>
                  </v-progress-linear>
                </template>
                <template v-if="engineStats.awarded.it2022rnr">
                  Current Frontline Rank Advancement
                  <v-progress-linear rounded color="blue" :height="25" :value="Math.round((engineStats.awarded.it2022rnr)/tripPoints*100)">
                    <template v-slot:default>
                        <strong v-if="!showStatsMaintenance"> {{engineStats.awarded.it2022rnr}} / {{tripPoints}}</strong>
                    </template>
                  </v-progress-linear>
                </template>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </template>
      <v-progress-linear v-else rounded color="rgb(195,163,194)" :height="25" indeterminate></v-progress-linear>
    </v-card-text>
    <v-card-title>HOW TO EARN ITP</v-card-title>
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
      const current = _.get(this, 'engineStats.awarded.it2022total', 0) || 0
      return current
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
      engineStats: state => state.comp.currentPeriod,
      openPeriod: state => state.comp.periods.open && state.comp.periods.open[0],
      previous: state => state.comp.previousPeriod
    }),
    ...mapGetters(['contactId', 'memberId', 'member', 'slug', 'tenantIntegrations'])
  }

}
</script>

<style scoped>

</style>
