<template>
  <v-card id="recent-sales-card">
    <v-toolbar color="secondary" dark>
      <v-toolbar-title>Earnings Summary</v-toolbar-title>
      <v-spacer></v-spacer>
      <PeriodSwitcher v-if="selectedPeriod"></PeriodSwitcher>
    </v-toolbar>
    <v-card-text class="pa-0">
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
  </v-card>
</template>

<script>
// import * as _ from 'lodash'
import { mapState, mapGetters } from 'vuex'

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
      loading: false
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
    ...mapGetters(['member']),
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
