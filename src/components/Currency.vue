<template>
  <span>{{formatCurrency(amount)}}</span>
</template>

<script>
export default {
  name: 'CompPlanLevel',
  props: {
    amount: Number
  },
  methods: {
    formatCurrency(total) {
      return total.toLocaleString('us-EN', {
        style: 'currency',
        currency: 'USD'
      })
    }
  }
}
</script>

<style scoped>
</style>
