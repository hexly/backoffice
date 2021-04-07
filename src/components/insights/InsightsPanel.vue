<template>
  <v-card>
    <v-card-title class="secondary title-class">
      <div cols="" class="white--text headline">{{data.labels.heading}}</div>
      <div id="close-btn" v-if="teamModalMode">
        <v-btn @click="$emit('closeModal')" icon class="white--text">
          <v-icon>close</v-icon>
        </v-btn>
        </div>
    </v-card-title>
    <v-card-text class="pa-1 insights-card">
      <h3 class="black--text text-center my-2" v-if="teamModalMode">{{displayName}}</h3>
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
    data: Object,
    teamModalMode: Boolean,
    displayName: String
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

#close-btn {
  position: absolute;
  right: 4px;
  top: 12px;
}

.title-class {
  word-break: normal;
}
</style>
