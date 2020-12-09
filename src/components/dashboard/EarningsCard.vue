<template>
  <v-card id="recent-sales-card">
    <v-toolbar color="secondary" dark>
      <v-toolbar-title v-if="!showInsights">Earnings Summary</v-toolbar-title>
      <v-toolbar-title v-else>Insights <sup>(beta)</sup></v-toolbar-title>
      <v-spacer></v-spacer>
      <PeriodSwitcher v-if="selectedPeriod"></PeriodSwitcher>
      <template>
        <v-btn v-if="!showInsights" icon small @click="showInsights = !showInsights">
          <v-icon>mdi-auto-fix</v-icon>
        </v-btn>
        <v-btn icon small v-else @click="showInsights = !showInsights">
          <v-icon>mdi-cash</v-icon>
        </v-btn>
      </template>
    </v-toolbar>
    <v-card-text class="pa-0" v-if="!showInsights">
      <v-container>
        <template v-if="!selectedPeriod.id || loading">
          <v-progress-circular indeterminate :size="30" :width="3" color="grey"></v-progress-circular>
        </template>
        <template v-else-if="selectedPeriod.id && !hasSummary">
          <v-alert
            class="inner-alert"
            type="warning"
            text
            dense>
            Our apologies, there is no information available for the selected period: {{selectedPeriod.name}}
          </v-alert>
        </template>
        <template v-else-if="hasSummary && !loading">
          <template v-if="summary.length === 0">
            <v-alert
              class="inner-alert"
              type="info"
              text
              dense>
              You have no payouts yet! Go share your link!
            </v-alert>
          </template>
          <template v-else>
            <v-alert
              v-if="selectedPeriod.status === 'closed'"
              class="inner-alert"
              icon="mdi-calendar-check"
              text
              dense
              type="info">
              You are currently viewing a past period
            </v-alert>
            <v-row v-for="s in summary" :key="s.reason" class="pa-0 earnings-row">
              <v-col cols="6">
                <h4>{{s.reason}}</h4>
                <small v-if="s.rate">Immediate payout at {{s.rate*100}}%</small>
                <small v-if="s.ledgerMemberId">For more information about this payout, click the dollar sign in rank requirements</small>
              </v-col>
              <v-col cols="6" class="text-right body-1">
                <strong>
                  <Currency :amount="(s.amountEarned || 0)/100" :currency="s.currency"/>
                </strong>
                <br/>
                <small>Earned</small>
              </v-col>
            </v-row>
            <v-row class="pa-0 earnings-row">
              <v-col cols="6">
                <h3>Total</h3>
                <small><a href="/payouts">View Individual Payouts</a></small>
              </v-col>
              <v-col cols="6" class="text-right body-1">
                <strong>
                  <Currency :amount="(total || 0)/100" :currency="summary[0].currency"/>
                </strong>
                <br/>
                <small>Earned</small>
              </v-col>
            </v-row>
          </template>
        </template>
      </v-container>
    </v-card-text>
    <v-card-text class="pa-0" v-else>
      <!-- <v-container fluid grid-list-xs class="text-center">
        <v-layout row wrap>
          <v-flex xs6 pa-3>
            <v-icon large color="light-blue">mdi-cash-usd-outline</v-icon>
            <h2>Top Seller</h2>
            <small>Team</small>
            <h3>David Welch</h3>
            <h4>12 Sales</h4>
          </v-flex>
          <v-flex xs6 pa-3>
            <v-icon large color="light-blue">mdi-cash-usd-outline</v-icon>
            <h2>Top Earner</h2>
            <small>Team</small>
            <h3>Andre Kradolfer</h3>
            <h4>$354</h4>
          </v-flex>
          <v-flex xs6 pa-3>
            <v-icon large color="light-blue">mdi-package-variant-closed</v-icon>
            <h2>Top Sold Product</h2>
            <small>Personal</small>
            <h3>Love Your Lips Gloss - Cheeky Cherry</h3>
          </v-flex>
          <v-flex xs6 pa-3>
            <v-icon large color="light-blue">mdi-package-variant-closed</v-icon>
            <h2>Top Sold Product</h2>
            <small>Team</small>
            <h3>I Am Posh</h3>
          </v-flex>
        </v-layout>
      </v-container> -->
      <v-container>
        <v-row class="pa-0 earnings-row">
          <v-col cols="1">
            <v-icon large color="light-blue">mdi-cash-usd-outline</v-icon>
          </v-col>
          <v-col cols="5">
            <h3>Top Seller</h3>
            <small>Team</small>
          </v-col>
          <v-col cols="6" class="text-right body-1">
            <strong>
              David Welch
            </strong>
            <br/>
            <small>12 Sales</small>
          </v-col>
        </v-row>
        <v-row class="pa-0 earnings-row">
          <v-col cols="1">
            <v-icon large color="light-blue">mdi-cash-usd-outline</v-icon>
          </v-col>
          <v-col cols="5">
            <h3>Top Earner</h3>
            <small>Team</small>
          </v-col>
          <v-col cols="6" class="text-right body-1">
            <strong>
              Andre Kradolfer
            </strong>
            <br/>
            <small>$356.21</small>
          </v-col>
        </v-row>
        <v-row class="pa-0 earnings-row">
          <v-col cols="1">
            <v-icon large color="light-blue">mdi-package-variant-closed</v-icon>
          </v-col>
          <v-col cols="5">
            <h3>Top Sold Product</h3>
            <small>Team</small>
          </v-col>
          <v-col cols="6" class="text-right body-1">
            <strong>
              Love Your Lips Gloss
            </strong>
            <br/>
            <small>Cheeky Cherry</small>
          </v-col>
        </v-row>
        <v-row class="pa-0 earnings-row">
          <v-col cols="1">
            <v-icon large color="light-blue">mdi-package-variant-closed</v-icon>
          </v-col>
          <v-col cols="5">
            <h3>Top Sold Product</h3>
            <small>Personal</small>
          </v-col>
          <v-col cols="6" class="text-right body-1">
            <strong>
              I Am Posh
            </strong>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
// import * as _ from 'lodash'
import { mapState } from 'vuex'

import Currency from '@/components/Currency'
import PeriodSwitcher from '@/components/PeriodSwitcher.vue'
import { PAYOUTS_SUMMARY } from '@/graphql/Payouts.gql'

export default {
  name: 'EarningsCard',
  components: {
    Currency,
    PeriodSwitcher
  },
  data() {
    return {
      summary: [],
      loading: false,
      showInsights: false
    }
  },
  apollo: {
    summary: {
      query: PAYOUTS_SUMMARY,
      variables() {
        return {
          input: {
            periodId: this.selectedPeriod.id
          }
        }
      },
      update({ payouts: { summary } }) {
        return summary
      },
      client: 'federated',
      loadingKey: 'loading'
    }
  },
  computed: {
    ...mapState({
      selectedPeriod: state => state.comp.selectedPeriod
    }),
    hasSummary() {
      return (this.selectedPeriod &&
              this.selectedPeriod.metadata &&
              this.selectedPeriod.metadata.version === 2)
    },
    total() {
      return this.summary.reduce((t, s) => {
        t += s.amountEarned
        return t
      }, 0)
    }
  }
}
</script>

<style scoped>
.earnings-row:nth-child(odd){
  background-color: #cecece;
}
.inner-alert {
  margin: -15px -16px 6px -16px;
}
</style>
