<template>
  <v-card>
    <v-toolbar color="secondary" dark>
      <v-toolbar-title>{{title}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <PeriodSwitcher :readOnly="true"></PeriodSwitcher>
    </v-toolbar>
    <v-card-text class="ma-0 pa-0">
      <v-tabs centered icons-and-text :value="tab" dense>
        <v-tab @click="activateTab('global')" to="global">
          Global
          <v-icon>public</v-icon>
        </v-tab>
        <v-tab @click="activateTab(market)" v-for="market in markets" :to="market" :key="market">
          {{market.toUpperCase()}}
          <Flag :name="market" />
        </v-tab>
      </v-tabs>
      <v-list dense v-if="marketLeaders.length > 0">
        <div
          v-for="(item, index) in marketLeaders"
          :key="`${item.memberId}-${index}`"
        >
          <v-list-item :key="item.displayName">
            <v-list-item-avatar>
              <img :src="scaleImage(item.profileUrl)">
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{item.displayName}} <Flag :name="item.market" /></v-list-item-title>
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
    </v-card-text>
  </v-card>
</template>

<script>
import PeriodSwitcher from '@/components/PeriodSwitcher.vue'
import Flag from '@/components/Flag.vue'
export default {
  name: 'LeaderBoard',
  components: {
    PeriodSwitcher,
    Flag
  },
  data() {
    return {
      tab: 'global',
      markets: ['usa', 'gbr', 'can', 'aus', 'nzl']
    }
  },
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
    activateTab(e) {
      this.tab = e
    },
    scaleImage (image) {
      if (image) {
        return image.replace('/image/upload', '/image/upload/w_80')
      }
      return this.$tenantInfo.placeholder
    }
  },
  computed: {
    marketLeaders() {
      if (this.tab !== 'global') {
        return this.leaders.filter(l => l.market === this.tab)
      }
      return this.leaders.slice(0, 10)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
