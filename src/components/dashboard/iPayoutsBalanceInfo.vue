<template>
  <v-card-text v-if="iPayouts" class="pt-3">
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
      <Currency :amount="currentBalance.balance" :currency="currentBalance.currency"/>
    </h2>
    <br/>
    <v-btn :loading="fetchingLoginUrl" :disabled="fetchingLoginUrl" class="ma-0" color="success" @click="visitIPayouts" small>Visit eWallet</v-btn>
  </v-card-text>
</template>

<script>
import _ from 'lodash'
import { IPAYOUTS_USER_BALANCE, IPAYOUTS_USER_AUTO_LOGIN } from '@/graphql/iPayouts.js'
import Currency from '@/components/Currency'
import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    Currency
  },
  mounted() {
    if (this.iPayouts) {
      this.loadBalance()
    }
  },
  data() {
    return {
      currentBalance: {
        balance: 0,
        currencyCode: this.currencyCode
      },
      fetchingLoginUrl: false
    }
  },
  methods: {
    async loadBalance() {
      // For now, everyone should be aware of the federated url since that is the future!
      if (_.get(this, '$apolloProvider.clients.federated')) {
        const { data: { userBalance } } = await this.$apollo.query({
          query: IPAYOUTS_USER_BALANCE,
          variables: {
            input: {
              username: this.iPayouts.integrationOid,
              tenantIntegrationId: this.iPayouts.tenantIntegrationId,
              currencyCode: this.currencyCode
            }
          },
          client: 'federated'
        })
        this.currentBalance = userBalance
      }
    },
    async visitIPayouts() {
      this.fetchingLoginUrl = true
      const { data: { autoLoginUser } } = await this.$apollo.mutate({
        mutation: IPAYOUTS_USER_AUTO_LOGIN,
        variables: {
          input: {
            username: this.iPayouts.integrationOid,
            tenantIntegrationId: this.iPayouts.tenantIntegrationId,
            currencyCode: this.currencyCode
          }
        },
        client: 'federated'
      })
      window.open(autoLoginUser.url, '_blank').focus()
      this.fetchingLoginUrl = false
    }
  },
  computed: {
    ...mapState({
      loading: state => state.loading,
      iPayouts: state => {
        return state.user.principal.member.tenantIntegrations.find(i => {
          return i.key === 'i_payouts' && i.priority === 0
        })
      }
    }),
    ...mapGetters(['memberId', 'currencyCode'])
  }
}
</script>
