<template>
    <div>
      <v-card width="100%">
        <v-toolbar color="secondary" dark>
          <v-toolbar-title>Recent Orders</v-toolbar-title>
          <v-spacer/>
        </v-toolbar>
        <v-row justify-space-between v-for="order in sortedData" :key="order.id">
          <v-col>
            <v-card-text>{{ order.customerName }}</v-card-text>
          </v-col>
          <v-col>
            <v-card-text>{{ order.productName }}</v-card-text>
          </v-col>
          <v-col>
            <v-card-text>{{ order.openedOn }}</v-card-text>
          </v-col>
          <v-col>
            <v-card-text>
              <Currency :amount="order.total / 100"/>
            </v-card-text>
          </v-col>
        </v-row>
      </v-card>
    </div>
</template>

<script>
import Currency from '@/components/Currency'

export default {
  components: {
    Currency
  },
  props: {
    orderData: Array
  },
  data() {
    return {
      sortedData: []
    }
  },
  watch: {
    orderData: function(val) {
      this.sortedData = val.slice(0).sort((a, b) => {
        return new Date(b.openedOn) - new Date(a.openedOn)
      }).slice(0, 5)
    }
  }
}
</script>
