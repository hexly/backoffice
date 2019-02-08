<template>
  <div class="comp-plan-level">
    <v-layout row wrap>
      <v-flex>
      <div class="ma-2" :style="{ border: `3px solid #${percent > 0 ? color: 'FFFFFF'}`}">
        <div class="pa-2 grey lighten-4 d-flex align-top">
          <div class="flex xs3 text-xs-left">
            <div class="header grey--text text--darken-1">Level</div>
            <div class="mono name">{{levelName}}</div>
          </div>
          <div class="flex xs3 text-xs-left">
            <div class="header grey--text text--darken-1">Size</div>
            <div class="mono name">{{level.size}}</div>
          </div>
          <div class="flex xs3 text-xs-left">
            <div class="header grey--text text--darken-1">Total Points</div>
            <div class="mono default">{{level.totalPoints}}</div>
          </div>
          <div class="flex xs3 text-xs-left">
            <div class="header grey--text text--darken-1">Total Amount</div>
            <div class="mono default">{{level.totalAmount}}</div>
          </div>
          <div class="flex xs3 text-xs-left">
            <div class="header grey--text text--darken-1">Recruited</div>
            <div class="mono default">{{level.recruited}}</div>
          </div>
          <div class="flex xs3 text-xs-left">
            <div class="header grey--text text--darken-1">Total Sales</div>
            <div class="mono default">{{level.sales}}</div>
          </div>
          <!-- <div class="flex xs3 text-xs-right">
            <div class="header grey--text text--darken-1">Commision</div>
            <div class="mono type"><Currency :amount="level.commissionablePoints * percent"/></div>
          </div> -->
        </div>
        <div class="pa-2 grey lighten-3 grey--text text--darken-2 d-flex">
          <div class="flex">
            <div class="justify">
              <p>{{notes}}</p>
            </div>
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
