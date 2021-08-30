<template>
  <v-flex xs12>
    <div class="about">
      <v-card>
        <v-card-title class="headline font-weight-regular white--text secondary">
          <span>{{mName || ''}} Sales History</span>
          <v-spacer></v-spacer>
          <v-btn icon dark @click="$emit('close')"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text>
          <v-subheader>Range</v-subheader>
          <v-container grid-list-md text-center>
            <v-layout row align-center justify-space-around wrap>
              <v-dialog
                ref="dialogStart"
                v-model="modalStart"
                lazy
                full-width
                width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-on="on"
                    v-model="startDate"
                    label="Select Start Date"
                    prepend-icon="event"
                    readonly
                  />
                </template>
                <v-date-picker
                  ref="pickerStart"
                  color="secondary"
                  v-model="datePickerStartDate"
                  :reactive="true"
                >
                  <v-spacer></v-spacer>
                  <v-btn text color="primary" @click="modalStart = false">Cancel</v-btn>
                  <v-btn
                    text
                    color="primary"
                    @click="dateSave(datePickerStartDate, 'start'); $refs.dialogStart.save()"
                  >OK</v-btn>
                </v-date-picker>
              </v-dialog>
              <v-dialog
                ref="dialogEnd"
                v-model="modalEnd"
                lazy
                full-width
                width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-on="on"
                    v-model="endDate"
                    label="Select End Date"
                    prepend-icon="event"
                    readonly
                  />
                </template>
                <v-date-picker
                  ref="pickerEnd"
                  color="secondary"
                  v-model="datePickerEndDate"
                  :reactive="true"
                >
                  <v-spacer></v-spacer>
                  <v-btn
                    text
                    color="primary"
                    @click="modalEnd = false"
                  >Cancel</v-btn>
                  <v-btn
                    text
                    color="primary"
                    @click="dateSave(datePickerEndDate, 'end'); $refs.dialogEnd.save()"
                  >OK</v-btn>
                </v-date-picker>
              </v-dialog>
            </v-layout>
          </v-container>
        </v-card-text>
      </v-card>
      <v-data-table
        :headers="headers"
        :items="items"
        hide-default-footer
        disable-pagination
        class="elevation-1"
        item-key="id"
        :expanded="expanded"
        show-expand
        :loading="loading"
        sort-by="date"
        :sort-desc="true"
      >
        <template v-slot:item="{ item, isExpanded }">
          <tr>
            <td>{{ item.date }}</td>
            <td>
              {{ item.customerName && /[^\s]/.test(item.customerName) ? item.customerName : 'Guest Customer' }}
            </td>
            <td>
              <Currency
                :amount="item.HexlyTotalAmount ? parseFloat(item.HexlyTotalAmount.toFixed(2)) : 0"
                :currency="item.currency"
              />
            </td>
            <td>{{ item.HexlyCommissionablePoints }}</td>
            <td>{{statusMap[item.statusOid] || item.statusOid}}</td>
            <td>
              <v-icon @click="expanded = []" v-if="isExpanded">expand_less</v-icon>
              <v-icon @click="expanded = [item]" v-else>expand_more</v-icon>
            </td>
          </tr>
        </template>
        <template v-slot:expanded-item="{ item, headers }">
          <td
            :colspan="headers.length"
            class="pa-3 sale-details"
          >
            <v-container fluid>
              <v-layout>
                <v-flex xs4>
                  <h4>Customer Info:</h4>
                  <ul>
                    <li>{{item.customerName}}</li>
                    <li v-if="item.customer">{{item.customer.email}}</li>
                    <li v-if="item.shipping">{{item.shipping.street}}</li>
                    <li v-if="item.shipping">{{item.shipping.city}}, {{item.shipping.province}} {{item.shipping.postalCode}}</li>
                  </ul>
                </v-flex>
                <v-flex xs4>
                  <h4>Details:</h4>
                  <ul>
                    <li>Order ID: {{item.id}}</li>
                    <li>Status: {{statusMap[item.statusOid] || item.statusOid}}</li>
                    <li v-if="item.customerNote">Customer Note: {{item.customerNote}}</li>
                    <!-- commenting out till we have a bead on what shipping stuff is gonna look like
                    <li v-if="checkShippingDate(item.metadata.WcShipmentTrackingItems)">
                      Shipped On: {{$moment(item.metadata.WcShipmentTrackingItems[0][0].dateShipped * 1000).format('ll')}}
                    </li>
                    <li v-if="checkTrackingInfo(item.metadata.WcShipmentTrackingItems)">
                      Tracking Info: <a
                        target="_blank"
                        :href="formatTrackingLink(item.metadata.WcShipmentTrackingItems[0][0])"
                      >{{item.metadata.WcShipmentTrackingItems[0][0].trackingNumber}}</a>
                    </li> -->
                  </ul>
                </v-flex>
              </v-layout>
              <v-layout my-4>
                <v-flex xs12>
                  <h4>Products & Services</h4>
                  <v-data-table
                    :headers="productHeads"
                    :items="item.lineItems"
                    hide-default-footer
                  >
                    <template v-slot:item="{ item: line }">
                      <tr>
                        <td>{{ line.name }}</td>
                        <td>
                          <Currency
                            :amount="parseFloat(line.itemPrice)"
                            :currency="item.currency"
                          />
                        </td>
                        <td>{{ line.quantity }}</td>
                        <td>
                          <Currency
                            :amount="parseFloat(line.itemPrice * line.quantity)"
                            :currency="item.currency"
                          />
                        </td>
                      </tr>
                    </template>
                    <template v-slot:body.append>
                      <tr v-if="item.discountTotal > 0">
                        <td>Discounts/Product Credit</td>
                        <td></td>
                        <td>
                          <Currency
                            :amount="parseFloat(item.discountTotal)"
                            :currency="item.currency"
                          />
                        </td>
                      </tr>
                      <tr v-if="item.taxTotal > 0">
                        <td>Taxes</td>
                        <td></td>
                        <td>
                          <Currency
                            :amount="parseFloat(item.taxTotal)"
                            :currency="item.currency"
                          />
                        </td>
                      </tr>
                      <tr v-if="item.shippingTotal > 0">
                        <td>Shipping</td>
                        <td></td>
                        <td>
                          <Currency
                            :amount="parseFloat(item.shippingTotal)"
                            :currency="item.currency"
                          />
                        </td>
                      </tr>
                    </template>
                  </v-data-table>
                </v-flex>
              </v-layout>
            </v-container>
          </td>
        </template>
      </v-data-table>
    </div>
    <v-snackbar
      v-model="showSnackbar"
    >
      {{snackbarMsg}}
      <v-btn flat color="primary" @click.native="showSnackbar = false">Close</v-btn>
    </v-snackbar>
  </v-flex>
</template>

<script>
import _ from 'lodash'
import Currency from '@/components/Currency.vue'
import DateSelector from '@/components/DateSelector.vue'
import { SEARCH_SALES_QUERY } from '@/graphql/Sales.gql'
import { Mutations } from '@/store'
import { mapMutations, mapState, mapGetters } from 'vuex'
const trackingProviders = {
  usps: 'https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=',
  parcelforce: 'https://www.parcelforce.com/portal/pw/track?trackNumber=',
  royalmail: 'https://www3.royalmail.com/track-your-item#/tracking-results/',
  ups: 'https://www.ups.com/track?loc=null&tracknum=',
  'canada-post': 'http://www.canadapost.ca/cpotools/apps/track/personal/findByTrackNumber?trackingNumber='
}
export default {
  components: {
    DateSelector,
    Currency
  },
  props: {
    mId: Number,
    mName: String
  },
  data () {
    return {
      statusMap: {
        'completed': 'Completed',
        'processing': 'Processing',
        'hxro-paid-await': 'Subscription Paid - Awaiting Shipping'
      },
      statuses: ['completed', 'processing', 'refunded', 'awaiting-shipment', 'export_for_shipping', 'POSTED', 'Awaiting Approval', 'SHIPPED', 'AWAITING FUNDS', 'ENTERED', 'hxro-paid-await'],
      datePickerStartDate: null,
      datePickerEndDate: null,
      modalStart: false,
      expanded: [],
      modalEnd: false,
      startDate: this.$moment()
        .subtract(30, 'days')
        .format('MM/DD/YYYY'),
      endDate: this.$moment()
        .format('MM/DD/YYYY'),
      headers: [
        { text: 'Date', value: 'date' },
        { text: 'Customer', value: 'customerName' },
        { text: 'Sale Total', value: 'total' },
        { text: 'Total Points', value: 'points' },
        { text: 'Status', value: 'statusOid' },
        { text: '', value: 'data-table-expand' }
      ],
      productHeads: [
        { text: 'Item', sortable: false },
        { text: 'Item Price', sortable: false },
        { text: 'Qty.', sortable: false },
        { text: 'Subtotal', sortable: false }
      ],
      sales: [],
      showSnackbar: false,
      snackbarMsg: ''
    }
  },
  apollo: {
    sales: {
      watchLoading (isLoading, countModifier) {
        this.setLoading(isLoading)
      },
      query: SEARCH_SALES_QUERY,
      variables () {
        const end = this.$moment(_.get(this, 'endDate', '1970-01-01')).format('YYYY-MM-DD')
        const start = this.$moment(_.get(this, 'startDate', '1970-01-01')).format('YYYY-MM-DD')
        return {
          input: {
            memberIn: [this.memberId],
            start,
            end
          }
        }
      },
      error (err) {
        this.setLoading(false)
        this.snackbarMsg = 'We were unable to find your orders! Please try again or contact support'
        this.showSnackbar = true
        console.error({ err })
      },
      debounce: 500,
      update (data) {
        const orders = _.get(data, 'purchaseSearchOrders', [])
        this.setLoading(false)
        const filteredOrders = orders.filter(sale => this.statuses.indexOf(sale.statusOid) >= 0)
        return filteredOrders
      },
      client: 'federated'
    }
  },
  methods: {
    ...mapMutations([Mutations.SET_LOADING]),
    checkShippingDate (trackingInfo) {
      return _.get(trackingInfo, '0.0.dateShipped', false)
    },
    checkTrackingInfo (trackingInfo) {
      return _.get(trackingInfo, '0.0.trackingNumber', false)
    },
    formatTrackingLink (trackingInfo) {
      if (trackingInfo.customTrackingLink) {
        return trackingInfo.customTrackingLink
      }
      const provider = trackingInfo.trackingProvider || trackingInfo.customTrackingProvider
      return trackingProviders[provider] + trackingInfo.trackingNumber
    },
    dateSave (datePickerDate, startOrEnd) {
      const varName = `${startOrEnd}Date`
      this[varName] = this.$moment(datePickerDate).format('MM/DD/YYYY')
    },
    startDateChanged (date) {
      this.$refs.dialogStart.save(date)
    },
    endDateChanged (date) {
      this.$refs.dialogEnd.save(date)
    }
  },
  computed: {
    ...mapState({
      loading: state => state.loading
    }),
    ...mapGetters(['memberId']),
    items () {
      const sales = _.get(this, 'sales', [])
      return sales.map(sale => {
        const saleDate = _.get(sale, 'checkedOutOn')
        const lineItems = _.get(sale, 'lines')
        const customerName = _.get(sale, 'customer.displayName')
        const HexlyTotalAmount = _.get(sale, 'compStats.HexlyTotalAmount')
        const HexlyCommissionablePoints = _.get(sale, 'compStats.HexlyCommissionablePoints')
        const date = sale.checkedOutOn ? this.$moment(saleDate, 'YYYY-MM-DD').format('MM/DD/YYYY') : ''
        return {
          ...sale,
          date,
          lineItems,
          customerName,
          HexlyTotalAmount,
          HexlyCommissionablePoints
        }
      })
    }
  }
}
</script>

<style scoped>
.sale-details {
  word-wrap: break-word;
}
.sale-details ul li {
  list-style: none;
}
a {
  cursor: pointer;
}
</style>
