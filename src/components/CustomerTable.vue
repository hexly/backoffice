<template>
  <v-card>
      <v-toolbar color="secondary" dark>
        <v-toolbar-title>Customers</v-toolbar-title>
        <v-spacer/>
      </v-toolbar>
    <v-data-table :headers="table.headers" :items="table.items" :key="table.key" @click:row="onClick"/>
  </v-card>
</template>

<script>
export default {
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
          }
        ]
      },
      customerName: ''
    }
  },
  methods: {
    onClick(item, details) {
      this.customerName = item.customerName
    }
  },
  computed: {
    customers() {
      const uniqueCustomers = new Set(this.orderData.map(item => item.customerName))
      let customerList = []

      uniqueCustomers.forEach(customer => {
        customerList.push({
          customerName: customer
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
