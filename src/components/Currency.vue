<template>
  <span>{{formatCurrency(amount)}}</span>
</template>

<script>
export default {
  name: 'Currency',
  props: {
    amount: {
      type: Number,
      default: 0
    }
  },
  methods: {
    formatCurrency (total) {
      return total.toLocaleString('us-EN', {
        style: 'currency',
        currency: 'USD'
      })
    }
  }
}
</script>
