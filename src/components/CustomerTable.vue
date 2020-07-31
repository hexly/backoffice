<template>
  <div class="customers">
    <v-row wrap>
      <v-col cols="6" xs="12">
        <v-flex>
          <v-card>
            <v-toolbar color="secondary" dark>
              <v-toolbar-title>Customers</v-toolbar-title>
              <v-spacer/>
            </v-toolbar>
            <v-card-text class="px-2">
              <v-text-field v-model="search" append-icon="mdi-magnify" label="Search"/>
              <v-data-table :headers="customerHeaders" :items="customers" @click:row="onClick" :search="search">
                <template v-slot:item.customerName="{ item }">
                  {{item.customerName || 'Guest Customer'}}
                </template>
                <template v-slot:item.total="{ item }">
                  <Currency :amount="item.total" :currency="item.currency"/>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-col>
      <v-col cols="6" xs="12">
        <v-card>
          <v-toolbar color="secondary" dark>
            <v-toolbar-title>Customer Ordered Products</v-toolbar-title>
            <v-spacer/>
          </v-toolbar>
          <v-data-table :headers="orderHeaders" no-data-text="Please Select A Customer" :items="orders">
            <template v-slot:item.itemPrice="{ item }">
              <Currency :amount="item.itemPrice" :currency="item.currency"/>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import Currency from '@/components/Currency.vue'
import { groupBy } from 'lodash'
export default {
  components: {
    Currency
  },
  props: {
    orderData: Array
  },
  data() {
    return {
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
    onClick(item, details) {
      this.customerName = item.customerName
      this.search = ''
    },
    backClick() {
      this.customerName = ''
      this.search = ''
    }
  },
  computed: {
    customers() {
      const uniqueCustomers = new Set(this.orderData.map(item => item.customerName))
      let customerList = []

      uniqueCustomers.forEach(customer => {
        const customerOrders = this.orderData.filter((obj) => obj.customerName === customer)
        const orders = groupBy(customerOrders, 'integrationOid')
        const orderCount = Object.keys(orders).length
        const total = customerOrders.reduce((total, c) => {
          return total + c.itemPrice
        }, 0)
        const recentOrder = this.$moment(customerOrders[0].checkedOutOn, 'YYYY-MM-DD').format('ll')
        customerList.push({
          customerName: customer,
          orderCount: orderCount,
          recentOrder: recentOrder,
          total,
          currency: recentOrder.currency
        })
      })
      return customerList
    },
    orders() {
      let orderList = []

      this.orderData.forEach((order, i) => {
        if (order.customerName === this.customerName) {
          let orderCopy = order
          orderCopy.date = this.$moment(order.checkedOutOn, 'YYYY-MM-DD').format('ll')
          orderList.push({ id: i, ...orderCopy })
        }
      })
      return orderList
    }
  }
}
</script>
