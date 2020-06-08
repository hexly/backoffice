<template>
  <span class="trend">
    <template v-if="trend === 0">
      <div>
        <small>{{Math.abs(trend.toFixed(1))}}%</small>
        <v-icon color="yellow">trending_flat</v-icon>
      </div>
      <small>No Change</small>
    </template>
    <template v-if="trend > 0">
      <div>
        <v-icon color="green">trending_up</v-icon>
        <small>{{Math.abs(trend.toFixed(1))}}%</small>
      </div>
      <small>Up since last month</small>
    </template>
    <template v-if="trend < 0">
      <div>
        <v-icon color="red">trending_down</v-icon>
        <small>{{Math.abs(trend.toFixed(1))}}%</small>
      </div>
      <small>Down since last month</small>
    </template>
  </span>
</template>

<script>

export default {
  name: 'Trend',
  props: {
    current: Number,
    previous: Number
  },
  computed: {
    trend() {
      if (this.current === 0 && this.previous === 0) {
        return 0
      } else if (this.previous === 0) {
        return this.current * 100
      }

      return ((this.previous - this.current) / this.previous) * -100
    }
  }
}
</script>

<style scoped>
.trend {
  display: inline-block;
  vertical-align: middle;
  padding-left: 5px;
  line-height: 10px;
  padding-bottom: 6px;
}
</style>
