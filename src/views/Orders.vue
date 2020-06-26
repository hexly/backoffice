<template>
  <div class="profile">
    <v-row wrap>
      <v-col cols="12" md="6">
        <v-flex>
          <RecentOrders :orderData="orderData"/>
        </v-flex>
      </v-col>
      <v-col cols="12" md="6">
        <OrderTable :orderData="orderData"/>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6">
        <CustomerTable :orderData="orderData"/>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import RecentOrders from '@/components/RecentOrders.vue'
import OrderTable from '@/components/OrderTable.vue'
import CustomerTable from '@/components/CustomerTable.vue'
import { mapState } from 'vuex'
import { ORDERS_QUERY } from '@/graphql/Orders.js'

export default {
  components: {
    OrderTable,
    RecentOrders,
    CustomerTable
  },
  data() {
    return {
      orderData: []
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
