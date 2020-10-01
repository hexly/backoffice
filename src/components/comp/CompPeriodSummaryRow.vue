<template>
  <tr>
    <td>
      Period Summary
    </td>
    <td>
      {{ _.get(row, 'ranking.name', 'No Rank Information Available')}}
    </td>
    <td v-for="(header) in headers.filter( (_,idx) => idx > 2)" :key="header.value">
      <template v-if="header.value == 'actions'">
      </template>
      <template v-else>
        {{ _.get(row, `${header.value}.totalPoints`, _.get(row.stats, header.value)) }}
      </template>
    </td>
  </tr>
</template>

<script>
export default {
  props: {
    headers: Array,
    data: Object,
    row: Object
  }
}
</script>
