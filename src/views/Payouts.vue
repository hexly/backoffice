<template>
  <v-flex xs12>
    <div class="payouts">
      <v-card>
        <v-card-title class="headline font-weight-regular white--text secondary">
          Payouts
        </v-card-title>
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
            <!-- <v-tooltip slot="append" bottom>
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
            </v-tooltip> -->
        </v-card-text>
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
              <td>{{ item.note ? item.note : '--' }}</td>
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
                <v-icon  @click="expanded = [item]" v-else>expand_more</v-icon>
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
import { MEMBER_INTEGRATION_COMMAND } from '@/graphql/Integrations'
import { GET_MEMBER_PAYOUTS } from '@/graphql/Member.gql'
import { Mutations } from '@/store'
import { mapMutations, mapState, mapGetters } from 'vuex'

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
      variables() {
        return {
          saleSearchInput: {
            sellerId: this.memberId,
            tenantId: this.$tenantId,
            query: null,
            endDate: this.endDate,
            startDate: this.startDate
          }
        }
      },
      error(err) {
        this.setLoading(false)
        console.error({ err })
      },
      debounce: 500,
      update({ getPrincipal }) {
        this.setLoading(false)
        return getPrincipal.member.payouts.filter(p => this.filterOut[this.statuses] < 0)
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
