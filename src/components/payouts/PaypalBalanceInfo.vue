<template>
  <v-card-text v-if="hasIntegration" class="pt-3">
    <v-alert type="success" v-if="transferSuccess">
      PayPal transfer successfully initiated!
    </v-alert>
    <h4>
        Available Funds:
        <v-tooltip slot="append" bottom>
        <template v-slot:activator="{ on }">
            <v-icon small v-on="on">help</v-icon>
        </template>
        <span><small>Total payouts in released status since last bank transfer</small></span>
        </v-tooltip>
    </h4>
    <h2>
        <Currency :amount="releasedBalance.amount / 100" :currency="releasedBalance.currency"/>
    </h2>
    <br/>
    <v-dialog v-model="transferDialog" width="500" :disabled="releasedBalance.amount < 25 || disableBalanceTransfer">
        <template v-slot:activator="{ on }">
        <v-btn class="ma-0" color="success" v-on="on" small :disabled="releasedBalance.amount < 25 || disableBalanceTransfer">Transfer To PayPal</v-btn>
        </template>
        <v-card>
        <v-card-title class="headline grey lighten-2" primary-title >
            Funds Transfer Policy
        </v-card-title>
        <v-card-text>
            <v-alert type="error" :value="transferError">{{transferError}}</v-alert>
            When transfering funds to PayPal, you will be charged a processing fee of $0.25/£0.17. Would you like to continue to transfer funds?
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
            <v-btn color="warning" text @click="transferDialog = false; transferError = null">no, dont transfer </v-btn>
            <v-spacer></v-spacer>
            <v-btn :loading="transferingFunds" :disabled="transferingFunds" color="success" text @click="attemptTransferFunds">Yes, Transfer Funds </v-btn>
        </v-card-actions>
        </v-card>
    </v-dialog>
    <div>
      <small v-if="releasedBalance.amount < 25">$0.25/£0.25 minimum to transfer to your PayPal</small>
    </div>
    <div class="mt-2">
      <v-btn href="https://www.paypal.com/" target="_blank" class="ma-0" color="success" small>Visit PayPal</v-btn>
    </div>
  </v-card-text>
</template>

<script>
import _ from 'lodash'
import Currency from '@/components/Currency'
import { mapGetters, mapState } from 'vuex'
import { delay } from '@/utils/timer.js'
import { GET_PAYOUTS_GROUPED, ATTEMPT_PAYOUTS_GROUPED } from '@/graphql/Payouts.gql'

export default {
  components: {
    Currency
  },
  mounted() {
    if (this.hasIntegration) {
      this.loadBalance()
    }
  },
  data() {
    return {
      status: {
        released: 'RELEASED'
      },
      releasedBalance: {
        amount: 0,
        currencyCode: this.currencyCode
      },
      pendingBalance: {
        amount: 0,
        currencyCode: this.currencyCode
      },
      transferDialog: false,
      transferingFunds: false,
      transferSuccess: false,
      transferError: null,
      fetchingLoginUrl: false
    }
  },
  methods: {
    async loadBalance() {
      // For now, everyone should be aware of the federated url since that is the future!
      if (_.get(this, '$apolloProvider.clients.federated')) {
        const { data: { payouts } } = await this.$apollo.query({
          query: GET_PAYOUTS_GROUPED,
          variables: {
            input: {
              tenantIntegrationKey: this.hasIntegration.key,
              statuses: [this.status.released]
            }
          },
          client: 'federated'
        })
        const releasedPayouts = _.find(payouts.groupedByStatus, { key: this.status.released })
        if (releasedPayouts) {
          console.log(releasedPayouts)
          this.releasedBalance.amount = releasedPayouts.total
          this.releasedBalance.currency = releasedPayouts.currency
        }
      }
    },
    async attemptTransferFunds() {
      // For now, everyone should be aware of the federated url since that is the future!
      if (_.get(this, '$apolloProvider.clients.federated')) {
        try {
          this.transferError = null
          this.transferingFunds = true
          const { data: { payouts } } = await this.$apollo.mutate({
            mutation: ATTEMPT_PAYOUTS_GROUPED,
            variables: {
              input: {
                tenantIntegrationKey: this.hasIntegration.key,
                statuses: [this.status.released]
              }
            },
            client: 'federated'
          })
          const releasedPayouts = _.find(payouts.groupedByStatus, { key: this.status.released })
          if (!releasedPayouts) {
            this.releasedBalance.amount = 0
          }
          this.transferDialog = false
          this.transferSuccess = true
          await delay(3000)
          this.transferSuccess = false
        } catch (e) {
          this.transferError = e.message
        }
        this.transferingFunds = false
      }
    }
  },
  computed: {
    ...mapState({
      loading: state => state.loading,
      hasIntegration: state => {
        return state.user.principal.member.tenantIntegrations.find(i => {
          return i.key === 'paypal_payouts' && i.priority === 0
        })
      },
      disableBalanceTransfer() {
      // all env vars come in as strings! yay!
        return process.env.VUE_APP_DISABLE_PAYPAL_FUNDING === 'true'
      }
    }),
    ...mapGetters(['memberId', 'currencyCode', 'integrations', 'member'])
  }
}
</script>