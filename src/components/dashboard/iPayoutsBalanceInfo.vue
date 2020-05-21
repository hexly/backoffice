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
      <Currency :amount="currentBalance.amount" :currency="currentBalance.curency"/>
    </h2>
    <br/>
    <v-btn class="ma-0" color="success" @click="visitIPayouts" small>Visit eWallet</v-btn>
  </v-card-text>
</template>

<script>
import _ from 'lodash'
import { IPAYOUTS_USER_BALANCE } from '@/graphql/iPayouts.js'
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
      balance: {}
    }
  },
  methods: {
    loadBalance() {
      // FOr now
      if (_.get(this, '$apolloProvider.clients.federated')) {
        this.$apollo.query({
          query: IPAYOUTS_USER_BALANCE,
          variables: {
            input: {
              username: this.iPayouts.integrationOid
            }
          },
          client: 'federated'
        })
      }
    },
    visitIPayouts() {

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
    ...mapGetters(['memberId']),
    currentBalance() {
      if (this.balance.amount) {
        return this.currentBalance.amount
      } else {
        return 0
      }
    }
  }
}
</script>
