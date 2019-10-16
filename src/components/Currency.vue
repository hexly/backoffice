<template>
  <span>{{formatCurrency}}</span>
</template>

<script>
export default {
  name: 'Currency',
  props: {
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  computed: {
    formatCurrency() {
      return this.amount.toLocaleString('us-EN', {
        style: 'currency',
        currency: this.currency
      })
    }
  }
}
</script>
