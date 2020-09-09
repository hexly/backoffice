<template>
  <v-card-text v-if="hasIntegration" class="pt-3">
    <template v-if="!iPayouts">
      <div class="py-2" v-if="!isNewMember">
        <h3>Hey There!</h3>
        We've recently switch to a new eWallet provider.
        If you are seeing this your account is not yet set up. Once you get paid your eWallet account will be created for you.
        You will receive an email with instructions on how to set it up.
        <br/>
        <b>Note: If you have any unpaid payouts in our system, we will get those paid to the new eWallet over the coming days.</b>
      </div>
      <div class="py-2" v-else>
        <h3>Welcome to your payouts screen.</h3>
        If you are seeing this your account is not yet set up. Once you get paid your eWallet account will be created for you.
        You will receive an email with instructions on how to set it up.
      </div>
    </template>
    <template v-else>
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
    </template>
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
        const { data: { payoutsUserBalance } } = await this.$apollo.query({
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
        this.currentBalance = payoutsUserBalance
      }
    },
    async visitIPayouts() {
      this.fetchingLoginUrl = true
      const { data: { payoutsAutoLoginUser } } = await this.$apollo.mutate({
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
      window.open(payoutsAutoLoginUser.url, '_blank').focus()
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
    isNewMember() {
      return this.$moment(this.member.joinedOn).isAfter(this.$moment('2020-05-23', 'YYYY-MM-DD'))
    },
    hasIntegration() {
      return this.integrations.find(i => i.key === 'i_payouts' && i.statusId === 200 && i.priority === 0)
    },
    ...mapGetters(['memberId', 'currencyCode', 'integrations', 'member'])
  }
}
</script>
