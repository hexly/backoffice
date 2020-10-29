<template>
  <v-flex xs12>
    <div class="payouts">
      <v-card>
        <PayoutsSelector @reload="loadSelectedIntegration" v-if="payoutIntegrations.length > 1" :integrations="payoutIntegrations"/>
        <StripeBalanceInfo v-if="selectedIntegration === 'stripe_connect'"/>
        <PaypalBalanceInfo v-else-if="selectedIntegration === 'paypal_payouts'"/>
        <iPayoutsBalanceInfo v-else-if="selectedIntegration === 'i_payouts'"/>
      </v-card>
      <v-card>
        <v-card-text>
          <v-subheader>Range</v-subheader>
          <v-container grid-list-md text-center>
            <v-layout row align-center justify-space-around wrap>
              <v-dialog ref="dialogStart" v-model="modalStart" width="290px">
                <template v-slot:activator="{ on }">
                  <v-text-field v-on="on" v-model="startDate" label="Select Start Date" prepend-icon="event" readonly/>
                </template>
                <v-date-picker ref="pickerStart" color="secondary" v-model="datePickerStartDate" :reactive="true">
                  <v-spacer></v-spacer>
                  <v-btn text color="primary" @click="modalStart = false">Cancel</v-btn>
                  <v-btn text color="primary" @click="dateSave(datePickerStartDate, 'start'); $refs.dialogStart.save()">OK</v-btn>
                </v-date-picker>
              </v-dialog>
              <v-dialog ref="dialogEnd" v-model="modalEnd" width="290px">
                <template v-slot:activator="{ on }">
                  <v-text-field v-on="on" v-model="endDate" label="Select End Date" prepend-icon="event" readonly/>
                </template>
                <v-date-picker ref="pickerEnd" color="secondary" v-model="datePickerEndDate" :reactive="true">
                  <v-spacer></v-spacer>
                  <v-btn text color="primary" @click="modalEnd = false">Cancel</v-btn>
                  <v-btn text color="primary" @click="dateSave(datePickerEndDate, 'end'); $refs.dialogEnd.save()">OK</v-btn>
                </v-date-picker>
              </v-dialog>
            </v-layout>
          </v-container>
        </v-card-text>
      </v-card>
      <v-responsive>
        <v-data-table
          disable-sort
          disable-pagination
          hide-default-footer
          :headers="headers"
          :items="payouts"
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
              <!-- <td>{{ item.releasedOn ? $moment(item.releasedOn).format('lll') : '--' }}</td> -->
              <td>{{ item.note ? item.note : '--' }}</td>
              <td>{{ item.integrationName }}</td>
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
        <v-pagination  class="pb-12 mb-12" v-model="page" :length="Math.ceil(totalResults/pageSize)" :total-visible="15"></v-pagination>
      </v-responsive>
    </div>
    <v-dialog
      v-model="transferDialog"
      width="290px"
    >
      <v-card></v-card>
    </v-dialog>
  </v-flex>
</template>

<script>
import _ from 'lodash'
import Currency from '@/components/Currency'
import StripeBalanceInfo from '@/components/payouts/StripeBalanceInfo'
import iPayoutsBalanceInfo from '@/components/payouts/iPayoutsBalanceInfo'
import PaypalBalanceInfo from '@/components/payouts/PaypalBalanceInfo'
import PayoutsSelector from '@/components/PayoutsSelector'
import { SEARCH_PAYOUTS } from '@/graphql/Payouts.gql'
import { Mutations } from '@/store'
import { mapMutations, mapState, mapGetters } from 'vuex'

export default {
  components: {
    Currency,
    StripeBalanceInfo,
    PaypalBalanceInfo,
    iPayoutsBalanceInfo,
    PayoutsSelector
  },
  mounted() {
    this.loadSelectedIntegration()
  },
  data() {
    return {
      page: 1,
      pageSize: 25,
      totalResults: 0,
      datePickerStartDate: null,
      datePickerEndDate: null,
      modalStart: false,
      modalEnd: false,
      startDate: this.$moment()
        .startOf('month')
        .format('MM/DD/YYYY'),
      endDate: this.$moment()
        .endOf('month')
        .format('MM/DD/YYYY'),
      selectedIntegration: null,
      transferDialog: false,
      transferingFunds: false,
      transferError: null,
      balance: {},
      expanded: [],
      headers: [
        { text: 'Payout Total', value: 'amount' },
        { text: 'Status', value: 'status' },
        { text: 'Issued Date', value: 'issuedOn' },
        // { text: 'Released Date', value: 'releasedOn' },
        { text: 'Notes', value: 'notes' },
        { text: 'Provider', value: 'integrationName' },
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
        NEEDS_ATTENTION: 'This payment requires help from support. Please open a support ticket if you have questions.',
        PENDING_REQUIREMENTS: 'You must be qualified this month to receive this payout'
      }
    }
  },
  apollo: {
    payouts: {
      query: SEARCH_PAYOUTS,
      variables() {
        return {
          input: {
            memberId: this.memberId,
            page: this.page,
            pageSize: this.pageSize,
            startDate: this.$moment(this.startDate).format('YYYY-MM-DD'),
            endDate: this.$moment(this.endDate).format('YYYY-MM-DD')
          }
        }
      },
      client: 'federated',
      watchLoading(isLoading, countModifier) {
        this.setLoading(isLoading)
      },
      update({ payouts }) {
        this.totalResults = payouts.search.totalResults
        return payouts.search.results
      }
    }
  },
  methods: {
    ...mapMutations([ Mutations.SET_LOADING ]),
    loadSelectedIntegration() {
      let selectedIntegration = _.minBy(this.payoutMemberIntegrations, 'priority')
      if (!selectedIntegration) {
        selectedIntegration = _.minBy(this.payoutIntegrations, 'priority')
      }
      this.selectedIntegration = selectedIntegration.key
    },
    dateSave(datePickerDate, startOrEnd) {
      const varName = `${startOrEnd}Date`
      this[varName] = this.$moment(datePickerDate).format('MM/DD/YYYY')
    },
    startDateChanged(date) {
      this.$refs.dialogStart.save(date)
    },
    endDateChanged(date) {
      this.$refs.dialogEnd.save(date)
    }
  },
  computed: {
    ...mapState({
      loading: state => state.loading
    }),
    ...mapGetters(['memberId', 'integrations', 'tenantIntegrations']),
    payoutIntegrations() {
      return this.integrations.filter(i => {
        return i.statusId === 200 &&
                  i.integrationMetadata &&
                  i.integrationMetadata.capabilities &&
                  i.integrationMetadata.capabilities.indexOf('payouts') >= 0
      })
    },
    payoutMemberIntegrations() {
      return this.tenantIntegrations.filter(i => {
        return _.find(this.payoutIntegrations, { key: i.key })
      })
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
