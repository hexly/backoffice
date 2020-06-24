<template>
  <v-flex xs12>
    <div class="payouts">
      <v-card>
        <v-card-title class="headline font-weight-regular white--text secondary">
          Payouts
        </v-card-title>
        <StripeBalanceInfo/>
        <iPayoutsBalanceInfo/>
      </v-card>
      <v-responsive>
        <v-data-table
          :headers="headers"
          :items="items"
          class="elevation-1"
          item-key="id"
          :loading="loading"
          :expanded="expanded"
          show-expand
        >
          <template v-slot:item="{ item, isExpanded }">
            <tr>
              <td>
                <Currency :amount="item.amount / 100" :currency="item.currency" />
              </td>
              <td class="text-capitalize">
                {{ item.status.toLowerCase() }}
                <v-tooltip v-if="statuses[item.status]" bottom>
                  <template v-slot:activator="{ on }">
                    <v-icon v-on="on" small>info</v-icon>
                  </template>
                  <span>{{statuses[item.status].toLowerCase()}}</span>
                </v-tooltip>
              </td>
              <td>{{ $moment(item.issuedOn).format('lll') }}</td>
              <td>{{ item.releasedOn ? $moment(item.releasedOn).format('lll') : '--' }}</td>
              <td>{{ item.note ? item.note : '--' }}{{item.currency}}</td>
              <td>
                <v-tooltip class="deduction-tooltip" v-if="item.deductions" left>
                  <template v-slot:activator="{ on }">
                    <Currency
                      v-on="on"
                      :amount="item.deductions.reduce((accumulator, curVal) => {
                        const retVal = accumulator + (curVal.amount / 100)
                        return retVal
                      }, 0)" :currency="item.currency"
                    />
                  </template>
                  <span>Total deductions. Click to see itemized deductions</span>
                </v-tooltip>
                <span v-else>--</span>
              </td>
              <td v-if="item.deductions.length">
                <v-icon @click="expanded = []" v-if="isExpanded">expand_less</v-icon>
                <v-icon @click="expanded = [item]" v-else>expand_more</v-icon>
              </td>
            </tr>
          </template>
          <template v-slot:expanded-item="{ item, headers }">
            <td :colspan="headers.length">
              <v-card flat>
                <v-card-text>
                  <h3>Deductions</h3>
                  <ul>
                    <li v-for="d in item.deductions" :key="d.id" >
                      <div>{{feeEnumMap[d.type]}}: <Currency class="body-2" :amount="d.amount / 100" :currency="item.currency" /></div>
                      <small>{{d.note}}</small>
                    </li>
                  </ul>
                </v-card-text>
              </v-card>
            </td>
          </template>
        </v-data-table>
      </v-responsive>
    </div>
    <v-dialog
      v-model="transferDialog"
      lazy
      full-width
      width="290px"
    >
      <v-card></v-card>
    </v-dialog>
  </v-flex>
</template>

<script>
import Currency from '@/components/Currency'
import StripeBalanceInfo from '@/components/dashboard/StripeBalanceInfo'
import iPayoutsBalanceInfo from '@/components/dashboard/iPayoutsBalanceInfo'
import { MEMBER_INTEGRATION_COMMAND } from '@/graphql/Integrations'
import { GET_MEMBER_PAYOUTS } from '@/graphql/Member.gql'
import { Mutations } from '@/store'
import { mapMutations, mapState, mapGetters } from 'vuex'

export default {
  components: {
    Currency,
    StripeBalanceInfo,
    iPayoutsBalanceInfo
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
      balance: {},
      expanded: [],
      headers: [
        { text: 'Payout Total', value: 'amount' },
        { text: 'Status', value: 'status' },
        { text: 'Issued Date', value: 'issuedOn' },
        { text: 'Released Date', value: 'releasedOn' },
        { text: 'Notes', value: 'notes' },
        { text: 'Deductions', value: 'deductions' },
        { text: '', value: 'data-table-expand' }
      ],
      feeEnumMap: {
        FEE: 'Misc. Fee',
        FEE_SERVICE: 'Service Fee',
        FEE_PROCESSING: 'Processing Fee',
        FEE_SHIPPING: 'Shipping Fee',
        FEE_HANDLING: 'Handling Fee',
        ADJUSTMENT_GENERIC: 'Adjustment',
        WITHHOLDING_GENERIC: 'Withholding'
      },
      payouts: [],
      filterOut: ['REVERSED'],
      statuses: {
        PENDING_RELEASE: 'Payment has been initialized and is being sent to payout processor',
        RELEASED: 'Payment is available to send to payout processor',
        SUBMITTED: 'Payment has been sent to payout processor',
        PROCESSING: 'Processing payment',
        FAILED: 'This payment failed. Please contact support for more information.',
        NEEDS_ATTENTION: 'This payment requires help from support. Please open a support ticket if you have questions.'
      }
    }
  },
  apollo: {
    items: {
      watchLoading(isLoading, countModifier) {
        this.setLoading(isLoading)
      },
      query: GET_MEMBER_PAYOUTS,
      error(err) {
        this.setLoading(false)
        console.error({ err })
      },
      debounce: 500,
      update({ getPrincipal }) {
        this.setLoading(false)
        return getPrincipal.member.payouts.filter(p => this.filterOut.indexOf(p.status) < 0)
      }
    }
  },
  methods: {
    ...mapMutations([ Mutations.SET_LOADING ]),
    startDateChanged(date) {
      this.$refs.dialogStart.save(date)
    },
    endDateChanged(date) {
      this.$refs.dialogEnd.save(date)
    },
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
    }
  },
  computed: {
    ...mapState({
      loading: state => state.loading,
      stripeConnect: state => {
        return state.user.principal.member.tenantIntegrations.find(i => i.key === 'stripe_connect')
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

<style scoped>
.sale-details ul li {
  list-style: none;
}
a {
  cursor: pointer;
}
.status-td {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.payouts {
  cursor: default;
}
.deduction-tooltip {
  cursor: pointer;
}
</style>
