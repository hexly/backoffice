<template>
  <v-flex xs12>
    <div class="payouts">
      <v-card>
        <v-card-title class="headline font-weight-regular white--text secondary">
          Payouts
        </v-card-title>
        <v-card-text v-if="stripeConnect && currentBalance">
            <h4>Available Funds:</h4>
            <small>Total payouts in paid status since last bank transfer</small>
            <h2>
              <Currency :amount="currentBalance.amount / 100" :currency="currentBalance.currency" />
            </h2>
            <br/>
            <v-dialog v-model="transferDialog" width="500" :disabled="currentBalance.amount < 500">
              <v-btn color="success" slot="activator" small :disabled="currentBalance.amount < 500">Transfer To My Bank</v-btn>
              <v-card>
                <v-card-title class="headline grey lighten-2" primary-title >
                  Funds Transfer Policy
                </v-card-title>
                <v-card-text>
                  When transfering funds to your bank manually, you will be charged a processing fee of $0.25/£0.10. Would you like to continue to transfer funds?
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                  <v-btn color="warning" flat @click="transferDialog = false">no, dont transfer </v-btn>
                  <v-spacer></v-spacer>
                  <v-btn color="success" flat @click="transferFunds">Yes, Transfer Funds </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <small v-if="currentBalance.amount < 500">$5/£5 minimum to transfer to your bank</small>
        </v-card-text>
      </v-card>
      <v-data-table
        :headers="headers"
        :items="items"
        hide-actions
        class="elevation-1"
        item-key="id"
        :loading="loading"
      >
        <template
          slot="items"
          slot-scope="props"
        >
          <tr @click="props.item.deductions ? props.expanded = !props.expanded : null">
            <td>
              <Currency :amount="props.item.amount" :currency="props.item.currency" />
            </td>
            <td class="status-td">
              {{ props.item.status }}
              <v-tooltip v-if="statuses[props.item.status]" bottom>
                <template slot="activator">
                  <v-chip class="hint-tip" color="grey lighten-2">
                    <span>?</span>
                  </v-chip>
                </template>
                <span>{{statuses[props.item.status]}}</span>
              </v-tooltip>
              <span v-else>{{ props.item.status }}</span>
            </td>
            <td>{{ $moment(props.item.issuedOn).format('lll') }}</td>
            <td>{{ props.item.status === 'RELEASED' ? $moment(props.item.releasedOn).format('lll') : '--' }}</td>
            <td>{{ props.item.note ? props.item.note : '--' }}</td>
            <td>
              <v-tooltip class="deduction-tooltip" v-if="props.item.deductions" left>
                <template slot="activator">
                  <Currency
                    :amount="props.item.deductions.reduce((accumulator, curVal) => {
                      const retVal = accumulator + curVal.amount
                      return retVal
                    }, 0)" :currency="props.item.currency"
                  />
                </template>
                <span>Total after deductions. Click to see itemized deductions</span>
              </v-tooltip>
              <span v-else>--</span>
            </td>
          </tr>
        </template>
        <template
          slot="expand"
          slot-scope="props"
        >
          <v-card flat>
            <v-card-title class="body-2" primary-title>Deductions</v-card-title>
            <v-card-text class="deductions-flex-container">
              <div
                v-for="d in props.item.deductions"
                :key="d.id"
              >
                <div>Type: <span class="body-2">{{feeEnumMap[d.type]}}</span></div>
                Amount: <Currency :amount="d.amount" :currency="props.item.currency" />
                <div>Date: {{$moment(d.issuedOn).format('lll')}}</div>
              </div>
            </v-card-text>
          </v-card>
        </template>
      </v-data-table>
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
import { mapMutations, mapState } from 'vuex'

const tenantId = ~~process.env.VUE_APP_TENANT_ID

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
      balance: {},
      headers: [
        { text: 'Payout Total', value: 'amount' },
        { text: 'Status', value: 'status' },
        { text: 'Issued Date', value: 'issuedOn' },
        { text: 'Released Date', value: 'releasedOn' },
        { text: 'notes', value: 'notes' },
        { text: 'Deductions', value: 'deductions' }
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
      mockData: [
        {
          id: 1,
          amount: 100,
          status: 'PENDING_RELEASE',
          issuedOn: this.$moment(),
          releasedOn: this.$moment(),
          notes: 'note',
          deductions: [
            {
              id: 123,
              amount: 69,
              type: 'FEE',
              issuedOn: this.$moment()
            },
            {
              id: 1234,
              amount: 69,
              type: 'FEE_SERVICE',
              issuedOn: this.$moment()
            },
            {
              id: 1235,
              amount: 69,
              type: 'FEE_SHIPPING',
              issuedOn: this.$moment()
            },
            {
              id: 1236,
              amount: 69,
              type: 'WITHHOLDING_GENERIC',
              issuedOn: this.$moment()
            }
          ]
        },
        {
          id: 2,
          amount: 100,
          status: 'RELEASED',
          issuedOn: this.$moment(),
          releasedOn: this.$moment(),
          notes: 'note'
        },
        {
          id: 3,
          amount: 100,
          status: 'SUBMITTED',
          issuedOn: this.$moment(),
          releasedOn: this.$moment(),
          notes: 'note'
        },
        {
          id: 4,
          amount: 100,
          status: 'PROCESSING',
          issuedOn: this.$moment(),
          releasedOn: this.$moment(),
          notes: 'note'
        },
        {
          id: 5,
          amount: 100,
          status: 'FAILED',
          issuedOn: this.$moment(),
          releasedOn: this.$moment(),
          notes: 'note'
        },
        {
          id: 6,
          amount: 100,
          status: 'NEEDS_ATTENTION',
          issuedOn: this.$moment(),
          releasedOn: this.$moment(),
          notes: 'note'
        }
      ],
      payouts: [],
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
            sellerId: this.$store.state.user.principal.memberId,
            tenantId,
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
        return getPrincipal.member.payouts
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
        }
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
    currentBalance() {
      if (this.balance.available && this.balance.available[0]) {
        return this.balance.available[0]
      }
      return null
    }
  }
}
</script>

<style scoped>
.hint-tip {
  cursor: pointer;
}
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
.deductions-flex-container {
  display: flex;
  justify-content: space-around;
  padding-top: 0px;
  padding-bottom: 30px;
}
</style>
