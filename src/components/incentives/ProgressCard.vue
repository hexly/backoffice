<template>
  <v-card :id="id">
    <v-toolbar color="secondary" dark>
      <v-toolbar-title> {{ title }} </v-toolbar-title>
      <v-spacer></v-spacer>
      <span>
        <PeriodSwitcher :readOnly="true"></PeriodSwitcher>
      </span>
    </v-toolbar>
    <v-card-text>
      <v-row v-for="row in rows" :key="row.id">
        <v-col v-for="col in row.cols" :key="col.key" class="text-center">
          <template v-if="col.type === 'circular'">
            <h4 v-if="col.title" v-html="col.title"></h4>
            <v-progress-circular
              :rotate="270"
              :size="100"
              :value="col.data.progress"
              :width="15"
              color="green lighten-3"
            >
              <div v-if="col.data.labels.progress" v-html="col.data.labels.progress"></div>
            </v-progress-circular>
            <h6 v-if="col.hint" v-html="col.hint"></h6>
          </template>
          <template v-else-if="col.type === 'linear'">
            <h4 v-if="col.title" v-html="col.title"></h4>
            <v-progress-linear
              :rotate="270"
              :size="100"
              :value="col.progress"
              :width="35"
              :height="20"
              color="green lighten-3"
            >
              <div v-if="col.label" v-html="col.label"></div>
            </v-progress-linear>
            <h6 v-if="col.hint" v-html="col.hint"></h6>
          </template>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>

import PeriodSwitcher from '@/components/PeriodSwitcher.vue'

export default {
  components: {
    PeriodSwitcher
  },
  props: {
    id: String,
    title: String,
    rows: {
      type: Array,
      required: true
    }
  }
}
</script>
