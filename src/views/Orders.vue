<template>
  <div class="profile">
    <v-tabs centered background-color="secondary" dark icons-and-text>
      <v-tabs-slider color="white"/>

      <v-tab to="#recentOrders">Recent Orders</v-tab>
      <v-tab to="#orderList">Order List</v-tab>

      <v-tab-item value="recentOrders" class="py-3">
        <v-lazy>
          recent Orders
        </v-lazy>
      </v-tab-item>

      <v-tab-item value="orderList" class="py-3">
        <v-lazy>
          <OrderTable/>
        </v-lazy>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import OrderTable from '@/components/OrderTable.vue'
export default {
  components: {
    OrderTable
  },
  name: 'Orders'
}
</script>
