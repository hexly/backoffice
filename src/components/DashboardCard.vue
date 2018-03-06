<template>
  <v-card :color="`${color} darken-${darken}`" class="white--text" :style="{overflow: 'hidden'}">
    <v-card-title primary-title>
      <div>
        <span class="display-2">{{display}}</span>
        <p class="subheading">{{subheading}}</p>
      </div>
    </v-card-title>
    <v-icon class="card-icon">{{icon}}</v-icon>
  </v-card>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    display: String,
    subheading: String,
    icon: String,
    color: String,
    darken: String
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
