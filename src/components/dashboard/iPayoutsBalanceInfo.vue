<template>
  <v-card-text v-if="iPayouts && currentBalance" class="pt-3">
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
      <Currrency :amount="currentBalance.amount" :currency="currentBalance.curency"/>
    </h2>
    <br/>
    <v-tooltip slot="append" bottom>
        <template v-slot:activator="{ on }">
        <v-dialog v-model="iPayoutsDialog" v-on="on" width="500">
            <template v-slot:activator="{ on }">
            <v-btn class="ma-0" color="success" v-on="on" small>Visit iPayouts</v-btn>
            </template>
        </v-dialog>
        </template>
    </v-tooltip>
  </v-card-text>
</template>

<script>
import { IPAYOUTS_USER_BALANCE } from '@/graphql/iPayouts.js'
import Currency from '@/components/Currency'
import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    Currency
  },
  mounted() {
    this.loadBalance()
  },
  data() {
    return {
      currentBalance: {}
    }
  },
  methods: {
    loadBalance() {
      this.$apollo.query({
        query: IPAYOUTS_USER_BALANCE,
        variables: {
          input: {
            tenantIntegrationId: this.iPayouts.tenantIntegrationId,
            data: {
              balance: this.currentBalance.amount,
              currencyCode: this.currentBalance.currencyCode
            }
          }
        }
      })
    },
    visitIPayouts() {
    
    }
  },
  computed: {
    ...mapState({
      loading: state => state.loading,
      iPayouts: state => {
        return state.user.principal.member.tenantIntegrations.find(i => {
          return i.key == 'iPayouts' && i.priority === 0
        })
      }
    })
  }
}
</script>