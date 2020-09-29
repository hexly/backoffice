<template>
  <tr>
    <td>
      Period Summary
    </td>
    <td>
      You got a rank!
    </td>
    <td v-for="(header) in headers.filter( (_,idx) => idx > 2)" :key="header.value">
      <template v-if="header.value == 'actions'">
      </template>
      <template v-else>
        {{ _.get(data.levels.root, `${header.value}.totalPoints`, _.get(data.levels.root, header.value)) }}
      </template>
    </td>
  </tr>
</template>

<script>
export default {
  props: {
    headers: Array,
    data: Object
  }
}
</script>
