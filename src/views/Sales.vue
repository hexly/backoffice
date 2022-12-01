<template>
  <v-flex xs12>
    <div class="about">
      <v-card>
        <v-card-title class="headline font-weight-regular white--text secondary">
          <span>{{mName || ''}} Sales History</span>
          <v-spacer></v-spacer>
          <v-btn v-if="!!mName" icon dark @click="$emit('close')"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text>
          <!-- <v-subheader>Range</v-subheader> -->
          <v-container grid-list-md class="fill-height text-center">
            <v-row>
              <v-col align-center>
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
              </v-col>
              <v-col align-center>
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
              </v-col>
            </v-row>
            <v-row align="stretch" v-if="sales && sales.stats" justify="center">
              <v-col v-for=" (metric, idx) in saleMetrics" :key="idx" lg="2" md="4" sm="6" cols="12">
                <div class="metric-card">
                  <v-avatar class="metric-avatar">
                    <v-icon large> {{ metric.icon }}</v-icon>
                  </v-avatar>
                  <div class="stat"> {{ sales.stats[metric.prop] || 0 }} </div>
                  <div class="label"> {{ metric.label }} </div>
                </div>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" class="text-center pa-0 pl-3 ma-0" text-justify>
                <small> <strong>Note:</strong> These statistics apply only to the searched date range. </small>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
      <v-data-table
        :headers="dynamicHeaders"
        :items="items"
        hide-default-footer
        disable-pagination
        class="elevation-1 mb-10"
        item-key="id"
        :expanded="expanded"
        show-expand
        :loading="loading"
        sort-by="date"
        :sort-desc="true"
      >
        <template v-slot:item="{ item, isExpanded }">
          <tr>
            <td>{{ $vuetify.breakpoint.xs ? $moment(item.date).format('l') : $moment(item.date).format('LL') }}</td>
            <td>
              <p>
              <v-tooltip slot="append" bottom>
                <template v-slot:activator="{ on }">
                  <v-icon v-if="item.guestCheckout" v-on="on">mdi-account-outline</v-icon>
                  <v-icon v-else v-on="on" >mdi-account</v-icon>
                  <div class="first-time-customer" v-if="item.firstTimeCustomer">
                    <v-icon class="first-time-tooltip" small v-on="on">mdi-party-popper</v-icon>
                  </div>
                </template>
                <span v-if="item.guestCheckout">  This order was processed as a guest checkout. </span>
                <span v-else-if="item.firstTimeCustomer">This was the first order by this registered customer. </span>
                <span v-else>This order was placed by a registered customer. </span>
              </v-tooltip>
              <span> {{ item.customerName && /[^\s]/.test(item.customerName) ? item.customerName : 'Guest Customer' }} </span>
              </p>
            </td>
            <td>
              <Currency
                :amount="item.total / 100"
                :currency="item.currency"
              />
            </td>
            <td>{{ item.HexlyCommissionablePoints }}</td>
            <td v-if="!$vuetify.breakpoint.xs">{{statusMap[item.statusOid] || item.statusOid}}</td>
            <td>
              <v-icon @click="expanded = []" v-if="isExpanded">expand_less</v-icon>
              <v-icon @click="expanded = [item]" v-else>expand_more</v-icon>
            </td>
          </tr>
        </template>
        <template v-slot:expanded-item="{ item, headers }">
          <td
            :colspan="headers.length"
            class="sale-details"
          >
            <v-container fluid pl-3 pt-3>
              <v-row>
                <v-col cols="12" sm="9" md="4" lg="3">
                  <v-container pa-0>
                    <v-row>
                      <v-col md="12">
                        <h4>Customer Info:</h4>
                        <ul>
                          <li> {{item.customerName}} </li>
                          <li v-if="item.customer">{{item.customer.email}}</li>
                          <li v-if="item.shippingAddress">{{item.shippingAddress.street}}</li>
                          <li v-if="item.shippingAddress">{{item.shippingAddress.city}}, {{item.shippingAddress.province}} {{item.shippingAddress.postalCode}}</li>
                        </ul>
                      </v-col>
                      <v-col md="12">
                        <h4>Details:</h4>
                        <ul>
                          <li>Order ID: {{item.integrationOid}}</li>
                          <li>Status: {{statusMap[item.statusOid] || item.statusOid}}</li>
                          <li v-if="item.customerNote">Customer Note: {{item.customerNote}}</li>
                          <li v-if="checkShippingDate(item.tracking)">
                            Shipped On: {{$moment(item.tracking[0].dateShipped * 1000).format('ll')}}
                          </li>
                          <li v-if="checkTrackingInfo(item.tracking)">
                            Tracking Info: <a
                              target="_blank"
                              :href="formatTrackingLink(item.tracking[0])"
                            >{{item.tracking[0].trackingNumber}}</a>
                          </li>
                        </ul>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-col>
                <v-col auto>
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
                </v-col>
              </v-row>
            </v-container>
          </td>
        </template>
      </v-data-table>
    </div>
    <v-snackbar v-model="showSnackbar">
      {{snackbarMsg}}
      <v-btn text color="primary" @click.native="showSnackbar = false">Close</v-btn>
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
        'hxro-paid-await': 'Subscription Paid - Awaiting Shipping',
        'await-fulfillment': 'Awaiting Fulfillment',
        'processing-intl': 'International Processing',
        'intl-wellness': 'Wellness Processing'
      },
      saleMetrics: [
        { label: 'Customer Purchases', prop: 'registeredPurchases', icon: 'mdi-cart' },
        { label: 'Guest Purchases', prop: 'guestPurchases', icon: 'mdi-cart-outline' },
        { label: 'New Customers', prop: 'newCustomers', icon: 'mdi-account-plus' },
        { label: 'Returning Customers', prop: 'returningCustomers', icon: 'mdi-account-convert' },
        { label: 'Total Customers', prop: 'totalCustomers', icon: 'mdi-account-group' }
      ],
      statuses: ['completed', 'processing', 'refunded', 'awaiting-shipment', 'export_for_shipping', 'POSTED', 'Awaiting Approval', 'SHIPPED', 'AWAITING FUNDS', 'ENTERED', 'hxro-paid-await', 'await-fulfillment', 'processing-intl', 'intl-wellness'],
      datePickerStartDate: null,
      datePickerEndDate: null,
      modalStart: false,
      expanded: [],
      modalEnd: false,
      startDate: this.$moment()
        .subtract(30, 'days')
        .format('MM/DD/YYYY'),
      endDate: this.$moment()
        .add(1, 'days')
        .format('MM/DD/YYYY'),
      headers: [
        { text: 'Date', value: 'date' },
        { text: 'Customer', value: 'customerName' },
        { text: 'Sale Total', value: 'total' },
        { text: 'Total Points', value: 'points' },
        { text: 'Status', value: 'statusOid' },
        { text: '', value: 'data-table-expand' }
      ],
      mobileHeaders: [
        { text: 'Date', value: 'date' },
        { text: 'Customer', value: 'customerName' },
        { text: 'Sale Total', value: 'total' },
        { text: 'Total Points', value: 'points' },
        { text: '', value: 'data-table-expand' }
      ],
      productHeads: [
        { text: 'Item', sortable: false },
        { text: 'Item Price', sortable: false },
        { text: 'Qty.', sortable: false },
        { text: 'Subtotal', sortable: false }
      ],
      sales: {},
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
        const memberId = this.mId || this.memberId
        return {
          input: {
            memberIn: [memberId],
            start,
            end
          }
        }
      },
      error (err) {
        this.setLoading(false)
        this.snackbarMsg = 'We were unable to find your orders! Please try again or contact support'
        this.showSnackbar = true
        console.error(err)
      },
      debounce: 500,
      update (data) {
        const stats = _.get(data, 'purchasing.orders.stats', {})
        const orders = _.get(data, 'purchasing.orders.results', [])
        this.setLoading(false)
        const compactOrders = _.compact(orders)
        const filteredOrders = compactOrders.filter(sale => this.statuses.indexOf(sale.statusOid) >= 0)
        return {
          results: filteredOrders,
          stats
        }
      },
      client: 'federated'
    }
  },
  methods: {
    ...mapMutations([Mutations.SET_LOADING]),
    checkShippingDate (trackingInfo) {
      return _.get(trackingInfo, '0.dateShipped', false)
    },
    checkTrackingInfo (trackingInfo) {
      return _.get(trackingInfo, '0.trackingNumber', false)
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
      const sales = _.get(this, 'sales.results', [])
      return sales.map(sale => {
        const awardedOn = _.get(sale, 'metadata.HexlyAwardedDate')
        const saleDate = _.get(sale, 'checkedOutOn')
        const lineItems = _.get(sale, 'lines')
        let customerName = _.get(sale, 'customer.displayName')
        if (sale.pii) {
          customerName = `${[sale.pii.firstName, sale.pii.lastName].join(' ')}`
        }
        const HexlyTotalAmount = _.get(sale, 'compStats.HexlyTotalAmount')
        const HexlyCommissionablePoints = _.get(sale, 'compStats.HexlyCommissionablePoints')
        const date = awardedOn || this.$moment(saleDate, 'YYYY-MM-DD').format('YYYY-MM-DD')
        return {
          ...sale,
          guestCheckout: !sale.customer,
          date,
          lineItems,
          customerName,
          HexlyTotalAmount,
          HexlyCommissionablePoints
        }
      })
    },
    dynamicHeaders() {
      const isMobile = _.get(this, '$vuetify.breakpoint.xs')
      const { mobileHeaders, headers } = this

      return isMobile ? mobileHeaders : headers
    }
  }
}
</script>

<style scoped>

.metric-card {
  border: 1px solid #efefef;
  text-align: left;
  padding: 8px 5px;
  height: 100%;
}
.metric-avatar {
  float: left;
  border: 1px solid 333;
  margin-right: 5px;
  background: #fff;
}

.first-time-customer {
  position: absolute;
}
.first-time-tooltip {
  position: relative;
  top: -32px;
  left: 16px;
}

.metric-card .stat {
  font-size: 15px;
  font-weight: bold;
}
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
