<template>
  <v-card>
    <v-toolbar color="secondary" dark>
      <v-toolbar-title>{{title}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <PeriodSwitcher :readOnly="true"></PeriodSwitcher>
    </v-toolbar>
    <v-list dense v-if="leaders.length > 0">
      <div
        v-for="(item, index) in leaders"
        :key="`${item.memberId}-${index}`"
      >
        <v-list-item :key="item.displayName">
          <v-list-item-avatar>
            <img :src="scaleImage(item.profileUrl)">
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{item.displayName}}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-list-item-title>
              <span v-if="message">{{message}}</span><strong>{{ item.points }}</strong>
            </v-list-item-title>
          </v-list-item-action>
        </v-list-item>
      </div>
    </v-list>
    <div class="text-center pa-2" v-else>
      No Leaders Yet
    </div>
  </v-card>
</template>

<script>
import PeriodSwitcher from '@/components/PeriodSwitcher.vue'
export default {
  name: 'SellerLeaderBoard',
  components: {
    PeriodSwitcher
  },
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
    },
    message: String
  },
  methods: {
    formatCurrency (total) {
      return total.toLocaleString('us-EN', {
        style: 'currency',
        currency: this.currency || 'USD'
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
