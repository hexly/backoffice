<template>
  <v-card :color="`${color} darken-${darken}`" :style="{overflow: 'hidden', height: '100%'}">
    <v-card-title primary-title>
      <div>
        <span v-if="!loading" class="display-2" style="position: relative; z-index: 1;">{{display}}</span>
        <span v-if="loading" class="display-2">
          <v-progress-circular indeterminate :size="30" :width="3" color="black"></v-progress-circular>
        </span>
        <div class="subheading">
          <span>{{subheading}}</span>
        </div>
      </div>
    </v-card-title>
    <v-card-text v-if="trend || trend === 0">
      <div style="width: 100%">
        <v-divider></v-divider>
        <div class="trend">
          <div v-if="trend < 0">
            <v-icon  color="red">trending_down</v-icon>
            <small>you are down {{Math.abs(trend.toFixed(2))}}% from last month</small>
          </div>
          <div v-if="trend > 0">
            <v-icon color="primary">trending_up</v-icon>
              <small>you are up {{Math.abs(trend.toFixed(2))}}% from last month</small>
          </div>
          <div v-if="trend === 0">
            <v-icon color="secondary">trending_flat</v-icon>
            <small>you are on track with last month</small>
          </div>
        </div>
      </div>
    </v-card-text>
    <v-icon class="card-icon" color="accent">{{icon}}</v-icon>
  </v-card>
</template>

<script>
export default {
  name: 'DashboardCard',
  props: {
    display: {
      type: [String, Number],
      default: 0
    },
    subheading: String,
    icon: String,
    color: String,
    darken: String,
    loading: Boolean,
    trend: Number
  }
}
</script>

<style scoped>
.trend {
  padding-top: 10px;
}
.trend i {
  vertical-align: middle;
  display: inline-block;
  margin-right: 10px;
}

.trend  small {
  color: grey;
}

v-card {
  overflow: hidden;
}

.card-icon {
  position: absolute;
  top: -15px;
  margin-left: 60%;
  font-size: 150px;
  color: rgba(0, 0, 0, 0.25);
}
</style>
