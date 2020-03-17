<template>
  <div>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'EarningsDashboard',
  data() {
    return {
      earnings: {}
    }
  },
  apollo: {
  },
  computed: {
    ...mapGetters(['memberId'])
  }
}
</script>

<style scoped>

</style>
