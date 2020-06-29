<template>
  <v-card>
    <v-toolbar color="secondary" dark>
      <v-toolbar-title>Customers</v-toolbar-title>
      <v-spacer/>
    </v-toolbar>
    <v-text-field v-model="search" append-icon="mdi-magnify" label="Search"/>
    <v-data-table :headers="table.headers" :items="table.items" :key="table.key" @click:row="onClick" :search="search">
      <template v-slot:footer v-if="this.customerName">
        <v-btn @click="backClick()">Back</v-btn>
      </template>
      <template v-slot:item.total="{ item }">
        <Currency :amount="item.total / 100"/>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import Currency from '@/components/Currency.vue'
export default {
  components: {
    Currency
  },
  props: {
    orderData: Array
  },
  data() {
    return {
      headers: {
        customer: [
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
          }
        ],
        order: [
          {
            text: 'Product',
            value: 'productName'
          },
          {
            text: 'Date',
            value: 'date'
          },
          {
            text: 'Total',
            value: 'total'
          },
          {
            text: 'Order Type',
            value: 'orderType'
          }
        ]
      },
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
        const orderCount = customerOrders.length
        const recentOrder = customerOrders.slice(0).sort((a, b) => {
          return new Date(b.openedOn) - new Date(a.openedOn)
        })[0].openedOn.split('T')[0]
        customerList.push({
          customerName: customer,
          orderCount: orderCount,
          recentOrder: recentOrder
        })
      })
      return customerList
    },
    orders() {
      let orderList = []

      this.orderData.forEach(order => {
        if (order.customerName === this.customerName) {
          let orderCopy = order
          orderCopy.date = order.openedOn.split('T')[0]
          orderList.push(orderCopy)
        }
      })
      return orderList
    },
    mode() {
      const { customerName } = this
      let entity = 'orders'

      if (!customerName) {
        entity = 'customers'
      }
      return {
        entity,
        customerName
      }
    },
    table() {
      switch (this.mode.entity) {
      case 'customers':
        return {
          key: 'id',
          headers: this.headers.customer,
          items: this.customers
        }
      case 'orders':
        return {
          key: 'id',
          headers: this.headers.order,
          items: this.orders
        }
      }
    }
  }
}
</script>
