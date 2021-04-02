<template>
  <v-list-item class="pa-1 insights-row">
    <v-list-item-content>
      <v-list-item-title>{{data.labels.title}}</v-list-item-title>
      <v-list-item-subtitle>{{data.labels.description}}</v-list-item-subtitle>
      <v-progress-linear v-if="data.progress || data.progress >= 0" color="green" height="25" :value="data.progress">
        <template v-slot:default="">
            <strong>{{data.labels.bar}}</strong>
          </template>
        </v-progress-linear>
      <v-progress-linear v-else-if="metadata.scope.parsed.careerDay" color="green" height="25" :value="(metadata.scope.parsed.careerDay/metadata.scope.parsed.goal)*100">
          <template v-slot:default="">
            <strong>{{data.labels.bar}}</strong>
          </template>
        </v-progress-linear>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
export default {
  props: {
    data: Object,
    metadata: Object
  }
}
</script>
