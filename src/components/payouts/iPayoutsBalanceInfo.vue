<template>
  <v-card-text v-if="tenantHasIntegration" class="pt-3">
    <template v-if="!iPayouts && !hasSetDefaultPayout">
      <div class="py-2">
        <h3>Welcome to your payouts screen.</h3>
        <div class="mt-3">
          eWallet/iPayout  Is a 3rd party. Once you receive your next commissionable sale you should receive an email from them with directions on how to set up your account.<p>They do require identity verification, so if you have updated or changed your information since signing up with a Everra, please do let us know.</p>
        </div>
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
        <Currency :amount="currentBalance.balance" :currency="currencyCode"/>
      </h2>
      <br />
      <v-btn
        :loading="fetchingLoginUrl"
        :disabled="fetchingLoginUrl"
        class="ma-0"
        color="success"
        @click="visitIPayouts"
        small
      >Visit eWallet</v-btn>
    </template>
  </v-card-text>
</template>

<script>
import _ from 'lodash'
import { IPAYOUTS_USER_BALANCE, IPAYOUTS_USER_AUTO_LOGIN } from '@/graphql/iPayouts.js'
import Currency from '@/components/Currency'
import { mapGetters, mapState } from 'vuex'

export default {
  props: {
    hasSetDefaultPayout: Boolean,
    payoutMemberIntegrations: Array
  },
  components: {
    Currency
  },
  mounted () {
    if (this.memberHasIntegration) {
      const t = this.integrations.find(i => i.key === 'i_payouts' && i.statusId === 200)
      this.integrationId = t.id
      this.loadBalance()
    }
  },
  data () {
    return {
      currentBalance: {
        balance: 0,
        currencyCode: this.currencyCode
      },
      fetchingLoginUrl: false,
      integrationId: null
    }
  },
  methods: {
    async loadBalance () {
      // For now, everyone should be aware of the federated url since that is the future!
      if (_.get(this, '$apolloProvider.clients.federated')) {
        const { data: { payoutsUserBalance } } = await this.$apollo.query({
          query: IPAYOUTS_USER_BALANCE,
          variables: {
            input: {
              username: this.iPayouts.integrationOid,
              tenantIntegrationId: this.integrationId,
              currencyCode: this.currencyCode
            }
          },
          client: 'federated'
        })
        this.currentBalance = payoutsUserBalance
      }
    },
    async visitIPayouts () {
      this.fetchingLoginUrl = true
      const { data: { payoutsAutoLoginUser } } = await this.$apollo.mutate({
        mutation: IPAYOUTS_USER_AUTO_LOGIN,
        variables: {
          input: {
            username: this.iPayouts.integrationOid,
            tenantIntegrationId: this.integrationId,
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
        return state.user.principal.member.integrations.find(i => {
          return i.key === 'i_payouts' && i.priority === 0
        })
      }
    }),
    isNewMember () {
      return this.$moment(this.member.joinedOn).isAfter(this.$moment('2020-05-23', 'YYYY-MM-DD'))
    },
    tenantHasIntegration () {
      const t = this.integrations.find(i => i.key === 'i_payouts' && i.statusId === 200)
      return t
    },
    memberHasIntegration () {
      const tenantHas = this.integrations.find(i => i.key === 'i_payouts' && i.statusId === 200)
      const memberHas = this.payoutMemberIntegrations.find(i => i.key === 'i_payouts' && i.priority === 0)
      return !!tenantHas && !!memberHas
    },
    ...mapGetters(['memberId', 'currencyCode', 'integrations', 'member'])
  }
}
</script>
