<template>
  <div>
    <v-toolbar color="primary white--text">
      <v-toolbar-title>Reports</v-toolbar-title>
    </v-toolbar>
    <v-data-table
      :headers="possibleReportsHeaders"
      :items="possibleReports"
      hide-default-footer
      class="elevation-1"
    >
      <template v-slot:item.actions="{ item }">
        <v-icon @click="$emit('runClick', item)">
          play_circle
        </v-icon>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  name: 'PossibleReportsTable',
  props: {
    possibleReportsHeaders: Array,
    possibleReports: Array
  }
}
</script>
