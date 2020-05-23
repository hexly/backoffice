<template>
  <v-card-text v-if="stripeConnect && currentBalance" class="pt-3">
    <h4>
        Available Funds:
        <v-tooltip slot="append" bottom>
        <template v-slot:activator="{ on }">
            <v-icon small v-on="on">help</v-icon>
        </template>
        <span><small>Total payouts in paid status since last bank transfer</small></span>
        </v-tooltip>
    </h4>
    <h2>
        <Currency :amount="currentBalance.amount / 100" :currency="currentBalance.currency"/>
    </h2>
    <br/>
    <v-tooltip slot="append" bottom>
        <template v-slot:activator="{ on }">
        <v-dialog v-model="transferDialog" v-on="on" width="500" :disabled="currentBalance.amount < 500">
            <template v-slot:activator="{ on }">
            <v-btn class="ma-0" color="success" v-on="on" small :disabled="currentBalance.amount < 500">Transfer To My Bank</v-btn>
            </template>
            <v-card>
            <v-card-title class="headline grey lighten-2" primary-title >
                Funds Transfer Policy
            </v-card-title>
            <v-card-text>
                <v-alert type="error" :value="transferError">{{transferError}}</v-alert>
                When transfering funds to your bank manually, you will be charged a processing fee of $0.25/£0.10. Would you like to continue to transfer funds?
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-btn color="warning" text @click="transferDialog = false; transferError = null">no, dont transfer </v-btn>
                <v-spacer></v-spacer>
                <v-btn :loading="transferingFunds" :disabled="transferingFunds" color="success" text @click="transferFunds">Yes, Transfer Funds </v-btn>
            </v-card-actions>
            </v-card>
        </v-dialog>
        </template>
        <span>
        <small v-if="currentBalance.amount < 500">$5/£5 minimum to transfer to your bank</small>
        <small v-if="currentBalance.amount >= 500">Funds should arrive in your bank within 48 hours</small>
        </span>
    </v-tooltip>
  </v-card-text>
</template>

<script>
import Currency from '@/components/Currency'
import { mapGetters, mapState } from 'vuex'
import { MEMBER_INTEGRATION_COMMAND } from '@/graphql/Integrations'

export default {
  components: {
    Currency
  },
  mounted() {
    if (this.stripeConnect) {
      this.loadBalance()
    }
  },
  data() {
    return {
      transferDialog: false,
      transferingFunds: false,
      transferError: null,
      balance: {}
    }
  },
  methods: {
    loadBalance() {
      this.$apollo.mutate({
        mutation: MEMBER_INTEGRATION_COMMAND,
        variables: {
          input: {
            command: 'stripe_connect_balance',
            tenantIntegrationId: this.stripeConnect.tenantIntegrationId,
            data: {
              accountOid: this.stripeConnect.integrationOid
            }
          }
        },
        update: (store, { data: { integrationCommand } }) => {
          this.balance = integrationCommand.metadata
        }
      })
    },
    transferFunds() {
      this.transferingFunds = true
      this.$apollo.mutate({
        mutation: MEMBER_INTEGRATION_COMMAND,
        variables: {
          input: {
            command: 'stripe_connect_transfer',
            tenantIntegrationId: this.stripeConnect.tenantIntegrationId,
            data: {
              accountOid: this.stripeConnect.integrationOid,
              amount: this.currentBalance.amount,
              currency: this.currentBalance.currency
            }
          }
        },
        update: (store, { data: { integrationCommand } }) => {
          this.loadBalance()
          this.transferDialog = false
          this.transferingFunds = false
        }
      }).catch(e => {
        this.transferError = e.message
        console.log(this.transferError)
        this.transferingFunds = false
      })
    }
  },
  computed: {
    ...mapState({
      stripeConnect: state => {
        return state.user.principal.member.tenantIntegrations.find(i => {
          return i.key === 'stripe_connect' && i.priority === 0
        })
      }
    }),
    ...mapGetters(['memberId']),
    currentBalance() {
      if (this.balance.instant_available && this.balance.instant_available[0]) {
        return this.balance.instant_available[0]
      }
      return null
    }
  }
}
</script>
