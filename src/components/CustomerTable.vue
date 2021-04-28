<template>
  <div class="customers">
    <v-row wrap>
      <v-col xs="12">
        <v-flex>
          <v-card>
            <v-toolbar color="secondary" dark>
              <v-toolbar-title>Customers</v-toolbar-title>
              <v-spacer/>
            </v-toolbar>
            <v-card-text class="px-2 customer-list">
              <v-text-field v-model="search" append-icon="mdi-magnify" label="Search"/>
              <v-data-table :loading="loading" single-select :headers="customerHeaders" item-key="customerName" :items="customers" @click:row="onClick" :search="search">
                <template v-slot:item.customerName="{ item }">
                  {{item.customerName || 'Guest Customer'}}
                </template>
                <template v-slot:item.recentOrder="{ item }">
                  {{item.recentOrder ? $moment(item.recentOrder, 'YYYY-MM-DD').format('ll') : null}}
                </template>
                <template v-slot:item.total="{ item }">
                  <Currency :amount="item.total" :currency="item.currency"/>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-col>
      <v-dialog
        v-model="showCustomerDialog"
        max-width="800px"
      >
        <v-card>
          <v-toolbar color="secondary" dark>
            <v-toolbar-title>Customer Ordered Products</v-toolbar-title>
            <v-spacer/>
          </v-toolbar>
          <v-data-table item-key="key" :headers="orderHeaders" no-data-text="Please Select A Customer" :items="orders">
            <template v-slot:item.date="{ item }">
              {{item.date ? $moment(item.date, 'YYYY-MM-DD').format('ll') : null}}
            </template>
            <template v-slot:item.itemPrice="{ item }">
              <Currency :amount="item.itemPrice" :currency="item.currency"/>
            </template>
          </v-data-table>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>

<script>
import Currency from '@/components/Currency.vue'
import { groupBy, cloneDeep, get } from 'lodash'
export default {
  components: {
    Currency
  },
  props: {
    orderData: Array,
    loading: Boolean
  },
  data() {
    return {
      showCustomerDialog: false,
      customerHeaders: [
        {
          text: 'Name',
          value: 'customerName'
        },
        {
          text: 'Number of Orders',
          value: 'orderCount'
        },
        {
          text: 'Most recent order date',
          value: 'recentOrder'
        },
        {
          text: 'Total Spent',
          value: 'total'
        }
      ],
      orderHeaders: [
        {
          text: 'Product',
          value: 'productName'
        },
        {
          text: 'Date',
          value: 'date'
        },
        {
          text: 'Order Id',
          value: 'integrationOid'
        },
        {
          text: 'Price',
          value: 'itemPrice'
        }
      ],
      customerName: '',
      search: ''
    }
  },
  methods: {
    onClick(item, row) {
      row.select(true)
      this.customerName = item.customerName
      this.showCustomerDialog = true
    },
    isSelected(item) {
      console.log(item)
      if (item.customerName === this.customerName) {
        return 'selected'
      }
      return ''
    }
  },
  computed: {
    customers() {
      if (!this.orderData) {
        return
      }

      const uniqueCustomers = new Set(this.orderData.map(item => item.customerName))
      let customerList = []

      uniqueCustomers.forEach(customer => {
        const customerOrders = this.orderData.filter((obj) => obj.customerName === customer)
        const orders = groupBy(customerOrders, 'integrationOid')
        const orderCount = Object.keys(orders).length
        const total = customerOrders.reduce((total, c) => {
          return total + c.itemPrice
        }, 0)
        const unparsedRecentOrder = customerOrders.find(el => el.checkedOutOn)
        let recentOrder = null
        if (unparsedRecentOrder) {
          recentOrder = unparsedRecentOrder.checkedOutOn
        }
        const currency = get(customerOrders[0], 'metadata.WcpbcPricingZone.currency')
        customerList.push({
          customerName: customer,
          orderCount,
          recentOrder,
          total,
          currency
        })
      })
      return customerList
    },
    orders() {
      if (!this.orderData) {
        return
      }
      let orderList = []

      this.orderData.forEach((order, i) => {
        if (order.customerName === this.customerName) {
          let orderCopy = cloneDeep(order)
          orderCopy.date = order.checkedOutOn
          orderCopy.key = i + order.productName
          orderList.push({ id: i, ...orderCopy })
        }
      })
      return orderList
    }
  }
}
</script>

<style>
  .customer-list tr {
    cursor: pointer !important;
  }
</style>
