<template>
  <v-flex xs12>
    <div class="payouts">
      <v-card>
        <v-card-title class="headline font-weight-regular white--text secondary">
          Payouts
        </v-card-title>
        <v-card-text v-if="stripeConnect && currentBalance">
            <h4>Available Funds:</h4>
            <h2>
              <Currency :amount="currentBalance.amount / 100" :currency="currentBalance.currency" />
            </h2>
            <small>Total payouts in paid status since last bank transfer</small>
            <!-- <v-btn color="success" v-if="currentBalance.amount > 0" @click="transferFunds" small>Transfer To your bank</v-btn> -->
        </v-card-text>
      </v-card>
      <v-data-table
        :headers="headers"
        :items="items"
        hide-actions
        class="elevation-1"
        item-key="id"
        expand
        :loading="loading"
      >
        <template
          slot="items"
          slot-scope="props"
        >
          <tr @click="props.expanded = !props.expanded">
            <td><Currency :amount="props.item.amount / 100" :currency="props.item.currency" /></td>
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
          </tr>
        </template>
      </v-data-table>
    </div>
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
      balance: {},
      headers: [
        { text: 'Payout Total', value: 'amount' },
        { text: 'Status', value: 'status' },
        { text: 'Issued Date', value: 'issuedOn' },
        { text: 'Released Date', value: 'releasedOn' },
        { text: 'notes', value: 'notes' }
      ],
      mockData: [
        {
          amount: 100,
          status: 'PENDING_RELEASE',
          issuedOn: this.$moment(),
          releasedOn: this.$moment(),
          notes: 'note'
        },
        {
          amount: 100,
          status: 'RELEASED',
          issuedOn: this.$moment(),
          releasedOn: this.$moment(),
          notes: 'note'
        },
        {
          amount: 100,
          status: 'SUBMITTED',
          issuedOn: this.$moment(),
          releasedOn: this.$moment(),
          notes: 'note'
        },
        {
          amount: 100,
          status: 'PROCESSING',
          issuedOn: this.$moment(),
          releasedOn: this.$moment(),
          notes: 'note'
        },
        {
          amount: 100,
          status: 'FAILED',
          issuedOn: this.$moment(),
          releasedOn: this.$moment(),
          notes: 'note'
        },
        {
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
          console.log(integrationCommand)
          this.loadBalance()
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
</style>
