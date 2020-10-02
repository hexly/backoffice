<template>
  <img class="flag-icon" :src="`/flags/${name}.svg`"/>
</template>

<script>
export default {
  name: 'CompRanksCard',
  props: {
    name: String
  }
}
</script>

<style scoped>
.flag-icon {
  display: inline-block;
  vertical-align: middle;
  height: 15px;
}
</style>
