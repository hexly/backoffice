<template>
  <v-card>
    <v-card-title class="secondary white--text headline">{{data.labels.heading}}</v-card-title>
    <v-card-text class="pa-1 insights-card">
      <p v-if="data.labels.description">{{data.labels.description}}</p>
      <v-list three-line class="pa-0 insights-list">
        <template v-for="(component, i) in data.components">
          <template v-if="component.display && component.visualizations[0] && component.visualizations[0] === 'HORIZONTAL_PROGRESS'">
            <InsightHorizontalProgress :data="component.settings" :metadata="component.metadata" :key="`${i}-${component.key}`"/>
          </template>
          <template v-if="component.visualizations[0] && component.visualizations[0] === 'AVATAR_QUAD_INFO'">
            <InsightAvatarQuadInfo :data="component.settings" :metadata="component.metadata" :key="`${i}-${component.key}`"/>
          </template>
          <template v-if="component.type === 'stat'">
            <v-list-item :key="`${i}-${component.key}`">
              <v-list-item-avatar>
                <v-icon v-if="component.labels.icon">{{component.labels.icon}}</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{component.labels.header}}</v-list-item-title>
                <v-list-item-subtitle>{{component.labels.tagline}}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-list-item-action-text> {{component.values.formatted}} </v-list-item-action-text>
                <v-list-item-action-text>{{component.values.value}}</v-list-item-action-text>
              </v-list-item-action>
            </v-list-item>
          </template>
        </template>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>
import InsightHorizontalProgress from '@/components/insights/InsightHorizontalProgress.vue'
import InsightAvatarQuadInfo from '@/components/insights/InsightAvatarQuadInfo.vue'

export default {
  name: 'InsightsPanel',
  components: {
    InsightHorizontalProgress,
    InsightAvatarQuadInfo
  },
  props: {
    data: Object
  }
}
</script>

<style>
.insights-card {
  max-height: 400px;
  overflow: auto;
}
.insights-row:nth-child(odd){
  background-color: #cecece;
}
</style>
