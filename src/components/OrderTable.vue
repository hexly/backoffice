<template>
    <div>
      <v-card width="100%">
        <v-toolbar color="secondary" dark>
          <v-toolbar-title>Order List</v-toolbar-title>
          <v-spacer/>
        </v-toolbar>
        <v-data-table :headers="headers" :items="orderData" item-key="id"/>
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
      headers: [
        { text: 'Order ID', value: 'id' },
        { text: 'Total', value: 'total' },
        { text: 'Customer ID', value: 'customerId' },
        { text: 'Customer Name', value: 'customerName' }
      ]
    }
  }
}
</script>
