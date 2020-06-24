<template>
    <div>
      <v-card width="100%">
        <v-toolbar color="secondary" dark>
          <v-toolbar-title>Order List</v-toolbar-title>
          <v-spacer/>
        </v-toolbar>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details/>
        <v-data-table :headers="headers" :items="orderData" item-key="id" :search="search"/>
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
        { text: 'Date', value: 'openedOn' },
        { text: 'Product', value: 'productName' },
        { text: 'Customer Name', value: 'customerName' }
      ],
      search: ''
    }
  }
}
</script>
