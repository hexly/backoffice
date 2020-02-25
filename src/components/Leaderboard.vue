<template>
  <v-card>
    <v-toolbar
      color="secondary"
      dark
    >
      <v-toolbar-title>{{title}}</v-toolbar-title>
    </v-toolbar>
    <v-list two-line dense>
      <div
        v-for="(item, index) in leaders"
        :key="`${item.contactEmail}-${index}`"
      >
        <v-list-item
          :key="item.name"
          avatar
        >
          <v-list-item-avatar>
            <img :src="scaleImage(item.profileUrl)">
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{item.name}}</v-list-item-title>
            <v-list-item-sub-title>{{item.contactEmail}}</v-list-item-sub-title>
          </v-list-item-content>
          <v-list-item-action v-if="showTotal">
            <v-list-item-title v-if="!currency">{{ item.total }}</v-list-item-title>
            <v-list-item-title v-if="currency">{{ formatCurrency(~~item.total) }}</v-list-item-title>
          </v-list-item-action>
        </v-list-item>
      </div>
    </v-list>
  </v-card>
</template>

<script>
export default {
  name: 'LeaderBoard',
  data() { return { } },
  props: {
    leaders: Array,
    title: String,
    currency: {
      type: Boolean,
      default: false
    },
    showTotal: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    formatCurrency (total) {
      return total.toLocaleString('us-EN', {
        style: 'currency',
        currency: 'USD'
      })
    },
    scaleImage (image) {
      if (image) {
        return image.replace('/image/upload', '/image/upload/w_80')
      }
      return this.$tenantInfo.placeholder
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
