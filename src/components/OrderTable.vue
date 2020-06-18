<template>
    <div>
      <v-data-table :headers="headers" :items="orderData" item-key="id"/>
    </div>
</template>

<script>
import { ORDERS_QUERY } from '@/graphql/Orders.js'
import { mapState } from 'vuex'

export default {
  data() {
    return {
      orderData: [],
      headers: [
        { text: 'Order ID', value: 'id' },
        { text: 'Total', value: 'total' },
        { text: 'Customer ID', value: 'customerId' },
        { text: 'Customer Name', value: 'customerName' }
      ]
    }
  },
  methods: {
    async loadOrders() {
      const results = await this.$apollo.query({
        query: ORDERS_QUERY,
        variables: {
          input: {
            referrerIn: this.user.principal.memberId,
            start: '2007-12-03',
            end: new Date().toISOString().split('T')[0]
          }
        },
        client: 'federated'
      })
      this.orderData = results.data.purchaseSearchOrders
    }
  },
  async mounted() {
    this.loadOrders()
  },
  computed: {
    ...mapState({
      user: state => state.user,
      showGate: state => state.showGate,
      integrations: state => state.integrations
    })
  }
}
</script>
