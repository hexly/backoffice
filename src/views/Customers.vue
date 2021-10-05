<template>
  <div class="customers py-2">
    <v-row wrap class="px-2">
      <v-col cols="12">
        <CustomerTable class="mt-4" :orderData="orderData" :loading="loading"/>
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
import { ORDERS_QUERY_FEDERATED } from '@/graphql/Orders.js'
import { get, uniqBy } from 'lodash'
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
      query: ORDERS_QUERY_FEDERATED,
      variables() {
        return {
          input: {
            memberIn: [this.user.principal.memberId]
          }
        }
      },
      client: 'federated',
      update(data) {
        const res = get(data, 'purchasing.purchaseSearchOrders')
        const duplicatesRemoved = uniqBy(res, el => el.id)
        return duplicatesRemoved
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
      integrations: state => state.integrations,
      tenantId: state => parseInt(state.tenantId)
    })
  }
}
</script>
