<template>
  <v-slide-x-transition>
    <div v-if="reportResults">
      <v-toolbar color="primary white--text">
        <v-toolbar-title>Results</v-toolbar-title>
        <v-spacer />
        <v-btn
          :disabled="!downloadURL"
          @click="$emit('downloadClicked')"
        >
          <v-icon class="mr-1">trending_up</v-icon>
          Download
        </v-btn>
      </v-toolbar>
      <v-data-table
        :headers="resultsHeaders"
        :items="reportResults"
        :items-per-page="-1"
        hide-default-footer
        class="elevation-1"
      />
    </div>
  </v-slide-x-transition>
</template>

<script>
export default {
  name: 'ReportResultsTable',
  props: {
    resultsHeaders: Array,
    reportResults: Array,
    downloadURL: String
  }
}
</script>
