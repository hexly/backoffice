<template>
  <tr class="item-row">
    <td v-for="(header) in headers" :key="header.value" :class="`col-${header.value}`">
      <template v-if="header.value == 'actions'">
        <v-icon @click="$emit('close')" v-if="expanded.find(e => e === item._id)">expand_less</v-icon>
        <v-icon  @click="$emit('expand')" v-else>expand_more</v-icon>
      </template>
      <template v-else>
        {{ _.get(item, `${header.value}.totalPoints`, _.get(item, header.value)) }}
      </template>
    </td>
  </tr>
</template>

<script>
export default {
  props: {
    headers: Array,
    item: Object,
    expanded: Array,
    expand: Function
  }
}
</script>

<style scoped>
.item-row >>> .col-actions {
  text-align: right
}
</style>
