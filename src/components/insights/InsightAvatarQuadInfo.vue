<template>
  <v-list-item class="pa-1 insights-row">
    <v-list-item-avatar>
      <img :src="getImage(data.labels.avatar.url)"/>
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title>{{data.labels.title.text}}</v-list-item-title>
      <v-list-item-subtitle>{{data.labels.titleMeta.text}}</v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action>
      <v-list-item-action-text>
        <v-chip :color="data.labels.value.color">{{data.labels.value.text}}</v-chip>
      </v-list-item-action-text>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
export default {
  props: {
    data: Object,
    metadata: Object
  },
  methods: {
    getImage (image) {
      if (image && image !== 'null') {
        return image
      }
      return this.$tenantInfo.placeholder
    }
  }
}
</script>
