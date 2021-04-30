<template>
  <div class="customers">
    <v-row wrap class="px-2">
      <v-col cols="12">
        <CustomerTable :orderData="orderData" :loading="loading"/>
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
import { get } from 'lodash'

export default {
  components: {
    OrderTable,
    RecentOrders,
    CustomerTable
  },
  data () {
    return {
      loading: false
    }
  },
  apollo: {
    orderData: {
      query: ORDERS_QUERY,
      variables() {
        return {
          input: {
            referrerIn: this.user.principal.memberId,
            start: '2007-12-03',
            end: new Date().toISOString().split('T')[0]
          }
        }
      },
      client: 'federated',
      update(data) {
        const res = get(data, 'purchaseSearchOrders')

        return res
      },
      watchLoading(isLoading) {
        this.loading = isLoading
      }
    }
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
