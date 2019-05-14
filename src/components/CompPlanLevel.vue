<template>
  <div class="comp-plan-level">
    <v-layout row wrap>
      <v-flex>
      <div class="my-1" :style="{ border: `3px solid #${percent > 0 ? color: 'FFFFFF'}`}">
        <div class="pa-1 grey lighten-4 d-flex align-top subheading">
          <div class="flex xs3 text-xs-left">
            <div class="mono name">{{levelName}}</div>
          </div>
          <div class="flex xs2 text-xs-left">
            <div class="mono name">{{level.size}}</div>
          </div>
          <div class="flex xs3 text-xs-left">
            <div class="mono default">{{level.totalPoints ? level.totalPoints.toFixed(2) : 0}}</div>
          </div>
          <div class="flex xs2 text-xs-left">
            <div class="mono default">{{level.recruited}}</div>
          </div>
          <div class="flex xs2 text-xs-left">
            <div class="mono default">{{level.sales}}</div>
          </div>
        </div>
      </div>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import Currency from '@/components/Currency.vue'
export default {
  name: 'CompPlanLevel',
  components: {
    Currency
  },
  props: {
    level: {
      type: Object,
      default () {
        return { size: 0 }
      }
    },
    levelName: String,
    percent: Number,
    notes: String,
    color: String
  }
}
</script>

<style scoped>
</style>
