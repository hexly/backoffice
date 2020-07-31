<template>
  <div class="customers">
    <v-row wrap class="px-2">
      <v-col cols="12">
        <v-flex>
          <CustomerTable :orderData="orderData"/>
        </v-flex>
      </v-col>
      <!-- <v-col cols="12">
        <RecentOrders :orderData="orderData"/>
      </v-col> -->
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
      console.log(results.data.purchaseSearchOrders)
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
