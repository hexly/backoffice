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
           <template v-if="! col.data">
             <h4 v-if="col.title" v-html="col.title"></h4>
             <v-icon class="no-data">warning</v-icon>
             <h6>No Data</h6>
           </template>
          <template v-else-if="col.metadata.visualisation.type === 'circular'">
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
          <template v-else-if="col.metadata.visualisation.type === 'linear'">
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
          <template v-else>
            <h4 v-if="col.title" v-html="col.title"></h4>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on" class="visualization-failed">warning</v-icon>
              </template>
              <span> Could not load this visualization </span>
            </v-tooltip>
            <h6 v-if="col.metadata.visualisation.hint" v-html="col.metadata.visualisation.hint"></h6>
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
    id: Number,
    title: String,
    rows: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped>
.no-data {
  padding: 15px !important;
}
</style>

<style scoped>
.visualization-failed {
  font-size: 50px;
  border: 1px solid #efefef;
  border-radius: 50%;
  padding: 35px;
  margin: 5px 0;
}
</style>
