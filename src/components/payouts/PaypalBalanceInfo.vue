<template>
  <v-card-text
    v-if="hasIntegration"
    class="pt-3"
  >
    <v-row>
      <v-col
        col="12"
        sm="12"
      >
        <v-alert
          type="success"
          v-if="transferSuccess"
        >
          PayPal transfer successfully initiated!
        </v-alert>
        <v-alert
          type="warning"
          v-if="!!warningMessage"
        >
          {{warningMessage}}
        </v-alert>
      </v-col>
    </v-row>
    <h4>
      Available Funds:
      <v-tooltip
        slot="append"
        bottom
      >
        <template v-slot:activator="{ on }">
          <v-icon small v-on="on">help</v-icon>
        </template>
        <span><small>Total payouts in released status since last bank transfer</small></span>
      </v-tooltip>
    </h4>
    <h2>
      <Currency :amount="releasedBalance.amount / 100" :currency="releasedBalance.currency"/>
    </h2>
    <br />
    <v-dialog
      v-model="transferDialog"
      width="500"
      :disabled="releasedBalance.amount < 25 || transferDisabled"
    >
      <template v-slot:activator="{ on }">
        <v-btn
          class="ma-0"
          color="success"
          v-on="on"
          small
          :disabled="releasedBalance.amount < 25 || transferDisabled"
        >Transfer To PayPal</v-btn>
      </template>
      <v-card>
        <v-card-title class="headline grey lighten-2" primary-title>
          PayPal Transfer Policy
        </v-card-title>
        <v-card-text>
          <v-alert type="error" :value="transferError" >{{transferError}}</v-alert>
          When transfering funds to PayPal, PayPal will charge you a processing fee of:
          <b>
            <Currency :amount="calcFee" :currency="releasedBalance.currency" />
          </b>
          <ul>
            <li v-for="(value, key) in fees" :key="key">
              {{key}}:
              <template v-if="value.flatRate">
                <Currency :amount="value.flatRate / 100" :currency="key"/>
              </template>
              <template v-else>
                {{value.percent}}% of transfer amount (up to <Currency :amount="value.cap / 100" :currency="key"/>)
              </template>
            </li>
          </ul>
          Would you like to continue to transfer funds?
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn
            color="warning"
            text
            @click="transferDialog = false; transferError = null"
          >no, dont transfer </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            :loading="transferingFunds"
            :disabled="transferingFunds"
            color="success"
            text
            @click="attemptTransferFunds"
          >Yes, Transfer Funds </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <div>
      <small v-if="releasedBalance.amount < 25">$0.25/£0.25 minimum to transfer to your PayPal</small>
    </div>
    <div class="mt-2">
      <v-btn
        href="https://www.paypal.com/"
        target="_blank"
        class="ma-0"
        color="success"
        small
      >Visit PayPal</v-btn>
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
  mounted () {
    if (this.hasIntegration) {
      this.loadBalance()
    }
  },
  data () {
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
      fetchingLoginUrl: false,
      fees: {
        USD: {
          flatRate: 25
        },
        GBP: {
          percent: 2,
          cap: 1400
        },
        CAD: {
          percent: 2,
          cap: 2400
        },
        AUD: {
          percent: 2,
          cap: 2400
        },
        NZD: {
          percent: 2,
          cap: 3000
        }
      }
    }
  },
  methods: {
    async loadBalance () {
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
          this.releasedBalance.amount = releasedPayouts.total
          this.releasedBalance.currency = releasedPayouts.currency
        }
      }
    },
    async attemptTransferFunds () {
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
      }
    }),
    calcFee() {
      const { amount, currency } = this.releasedBalance
      const fee = this.fees[currency]
      let calculatedFee = 0
      if (fee.flatRate) {
        calculatedFee += fee.flatRate
      }
      if (fee.percent) {
        calculatedFee += Math.min(amount * (fee.percent / 100), fee.cap)
      }
      return calculatedFee / 100
    },
    payPalIntegration () {
      return this.integrations.find(i => {
        return i.key === 'paypal_payouts'
      })
    },
    transferDisabled () {
      return this.payPalIntegration && this.payPalIntegration.metadata && this.payPalIntegration.metadata.disableTransfer
    },
    warningMessage () {
      if (this.payPalIntegration && this.payPalIntegration.metadata && this.payPalIntegration.metadata.warning) {
        return this.payPalIntegration.metadata.warning
      }
      return false
    },
    ...mapGetters(['memberId', 'currencyCode', 'integrations', 'member'])
  }
}
</script>
