<template>
  <v-flex xs12>
    <div class="about">
      <v-card>
        <v-card-title class="headline font-weight-regular white--text secondary">Order History</v-card-title>
        <v-card-text>
          <v-subheader>Range</v-subheader>
          <v-container grid-list-md text-center>
            <v-layout row align-center justify-space-around wrap>
              <v-dialog ref="dialogStart" v-model="modalStart" lazy full-width width="290px">
                <template v-slot:activator="{ on }">
                  <v-text-field v-on="on" v-model="startDate" label="Select Start Date" prepend-icon="event" readonly/>
                </template>
                <v-date-picker ref="pickerStart" color="secondary" v-model="datePickerStartDate" :reactive="true">
                  <v-spacer></v-spacer>
                  <v-btn text color="primary" @click="modalStart = false">Cancel</v-btn>
                  <v-btn text color="primary" @click="dateSave(datePickerStartDate, 'start'); $refs.dialogStart.save()">OK</v-btn>
                </v-date-picker>
              </v-dialog>
              <v-dialog ref="dialogEnd" v-model="modalEnd" lazy full-width width="290px">
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
      <v-data-table :headers="headers" :items="items" hide-default-footer disable-pagination class="elevation-1" item-key="id" :expanded="expanded" show-expand :loading="loading">
        <template v-slot:item="{ item, isExpanded }">
          <tr>
            <td>{{ item.date }}</td>
            <td>
              {{ item.billingFirstName }} {{ item.billingLastName }}
            </td>
            <td>
              <Currency :amount="parseFloat(item.total)" :currency="item.currency"/>
            </td>
            <td>{{ item.totalPoints }}</td>
            <td>{{ item.status }}</td>
            <td>
              <v-icon @click="expanded = []" v-if="isExpanded">expand_less</v-icon>
              <v-icon  @click="expanded = [item]" v-else>expand_more</v-icon>
            </td>
          </tr>
        </template>
        <template v-slot:expanded-item="{ item, headers }">
          <td :colspan="headers.length" class="pa-3 sale-details">
            <v-container fluid>
              <v-layout>
                <v-flex xs4>
                  <h4>Customer Info:</h4>
                  <ul>
                    <li>{{item.shippingFirstName}} {{item.shippingLastName}}</li>
                    <li>{{item.billingEmail}}</li>
                    <li>{{item.shippingCity}}, {{item.shippingState}} {{item.shippingZip}}</li>
                  </ul>
                </v-flex>
                <v-flex xs4>
                  <h4>Details:</h4>
                  <ul>
                    <li>Originating ID: {{item.providerOid}}</li>
                    <li>Status: {{item.status}}</li>
                    <li v-if="item.customerNote">Customer Note: {{item.customerNote}}</li>
                  </ul>
                </v-flex>
              </v-layout>
              <v-layout my-4>
                <v-flex xs12>
                  <h4>Products & Services</h4>
                  <v-data-table :headers="productHeads" :items="item.lineItems" hide-default-footer>
                    <template v-slot:item="{ item: line }">
                      <tr>
                        <td>{{ line.name }}</td>
                        <td>{{ line.quantity }}</td>
                        <td>
                          <Currency :amount="parseFloat(line.subtotal)" :currency="item.currency"/>
                        </td>
                      </tr>
                    </template>
                    <template v-slot:body.append>
                      <tr v-if="item.discountTotal > 0">
                        <td>Discounts/Product Credit</td>
                        <td></td>
                        <td>
                          <Currency :amount="parseFloat(item.discountTotal)" :currency="item.currency"/>
                        </td>
                      </tr>
                      <tr v-if="item.taxTotal > 0">
                        <td>Taxes</td>
                        <td></td>
                        <td>
                          <Currency :amount="parseFloat(item.taxTotal)" :currency="item.currency"/>
                        </td>
                      </tr>
                      <tr v-if="item.shippingTotal > 0">
                        <td>Shipping</td>
                        <td></td>
                        <td>
                          <Currency :amount="parseFloat(item.shippingTotal)" :currency="item.currency"/>
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
  </v-flex>
</template>

<script>
import Currency from '@/components/Currency.vue'
import DateSelector from '@/components/DateSelector.vue'
import { SEARCH_SALES_QUERY } from '@/graphql/Sales.gql'
import { Mutations } from '@/store'
import { mapMutations, mapState, mapGetters } from 'vuex'

export default {
  components: {
    DateSelector,
    Currency
  },
  data() {
    return {
      statuses: ['completed', 'processing', 'refunded', 'awaiting-shipment', 'POSTED', 'Awaiting Approval', 'SHIPPED', 'AWAITING FUNDS', 'ENTERED'],
      datePickerStartDate: null,
      datePickerEndDate: null,
      modalStart: false,
      expanded: [],
      modalEnd: false,
      startDate: this.$moment()
        .startOf('month')
        .format('MM/DD/YYYY'),
      endDate: this.$moment()
        .endOf('month')
        .format('MM/DD/YYYY'),
      headers: [
        { text: 'Date', value: 'date' },
        { text: 'Customer', value: 'customer' },
        { text: 'Sale Total', value: 'total' },
        { text: 'Total Points', value: 'points' },
        { text: 'Status', value: 'status' },
        { text: '', value: 'data-table-expand' }
      ],
      productHeads: [
        { text: 'Item', sortable: false },
        { text: 'Qty.', sortable: false },
        { text: 'subtotal', sortable: false }
      ],
      sales: []
    }
  },
  apollo: {
    sales: {
      watchLoading(isLoading, countModifier) {
        this.setLoading(isLoading)
      },
      query: SEARCH_SALES_QUERY,
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
      update({ searchSalesBySellerId }) {
        this.setLoading(false)
        return searchSalesBySellerId.filter(sale => this.statuses.indexOf(sale.status) >= 0)
      }
    }
  },
  methods: {
    ...mapMutations([ Mutations.SET_LOADING ]),
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
    ...mapGetters(['memberId']),
    items() {
      return (this.sales || []).map(sale => ({
        ...sale,
        id: sale.saleId,
        date: this.$moment(sale.awardedDate, 'YYYY-MM-DD').format('MM/DD/YYYY')
      }))
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
</style>
