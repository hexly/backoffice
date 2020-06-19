<template>
    <div>
      <v-card width="100%">
        <v-toolbar color="secondary" dark>
          <v-toolbar-title>Recent Orders</v-toolbar-title>
          <v-spacer/>
        </v-toolbar>
        <v-row justify-space-between v-for="order in sortedData" :key="order.id">
          <v-col>
            <v-card-text>ID: {{ order.id }}</v-card-text>
          </v-col>
          <v-col>
            <v-card-text>Customer: {{ order.customerName }}</v-card-text>
          </v-col>
          <v-col>
            <v-card-text>Opened On: {{ order.openedOn }}</v-card-text>
          </v-col>
        </v-row>
      </v-card>
    </div>
</template>

<script>
export default {
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
      }).slice(0, 10)
    }
  }
}
</script>
