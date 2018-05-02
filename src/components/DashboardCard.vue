<template>
  <v-card :color="`${color} darken-${darken}`" class="white--text" :style="{overflow: 'hidden'}">
    <v-card-title primary-title>
      <div>
        <span v-if="!loading" class="display-2">{{display}}</span>
        <span v-if="loading" class="display-2">
          <v-progress-circular indeterminate :size="30" :width="3" color="white"></v-progress-circular>
        </span>
        <p class="subheading">{{subheading}}</p>
      </div>
    </v-card-title>
    <v-icon class="card-icon">{{icon}}</v-icon>
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
    loading: Boolean
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
