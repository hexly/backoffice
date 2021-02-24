<template>
  <div>
    <template v-if="payouts">
      <p class="body-1">Here is a breakdown of the month end payout you received for the selected period you are viewing.</p>
      <v-row>
        <v-divider/>
      </v-row>
      <v-row v-for="(value, key) in mapping.immediate" :key="key" class="pa-0">
        <v-col cols="6">
          <h3>{{value}}</h3>
        </v-col>
        <v-col cols="6" class="text-right body-1">
          <strong>
            <Currency :amount="payouts[key]" />
          </strong>
        </v-col>
      </v-row>
      <v-row>
        <v-divider/>
      </v-row>
      <v-row v-for="(value, key) in mapping.overrides" :key="key" class="pa-0">
        <v-col cols="6" class="body-2" v-if="['total', 'overrides'].indexOf(key) >= 0">
          <h3>{{value}}</h3>
        </v-col>
        <v-col cols="6" class="body-2" v-else>
          {{value}}
        </v-col>
        <v-col cols="6" class="text-right body-1" v-if="['total', 'overrides'].indexOf(key) >= 0">
          <strong>
            <Currency :amount="payouts[key]" />
          </strong>
        </v-col>
        <v-col cols="6" class="text-right body-1" v-else>
          <Currency :amount="payouts[key]" />
        </v-col>
      </v-row>
      <v-row>
        <v-divider/>
      </v-row>
      <v-row v-for="(value, key) in mapping.grandTotal" :key="key" class="pa-0">
        <v-col class="body-2" cols="6">
          <h3>{{value}}</h3>
        </v-col>
        <v-col cols="6" class="text-right body-1">
          <strong><Currency :amount="payouts[key]" /></strong>
        </v-col>
      </v-row>
    </template>
    <template v-else>
      <v-alert type="warning">
        Please select a closed period to show payout breakdown.
      </v-alert>
    </template>
  </div>
</template>

<script>
import Currency from '@/components/Currency'

export default {
  name: 'PeriodPayouts',
  components: {
    Currency
  },
  props: {
    payouts: Object
  },
  data() {
    return {
      mapping: {
        grandTotal: {
          grandTotal: 'Grand Total'
        },
        immediate: {
          alreadyPaid: 'Immediate Payouts (Already Paid)'
        },
        overrides: {
          personal: 'Personal Sales',
          powerSeller: 'Influencer Bonus',
          fssb: 'Fast Start Sponsor Bonus',
          level1: 'Level 1 Bonus',
          level2: 'Level 2 Bonus',
          level3: 'Level 3 Bonus',
          group: 'Group Bonus',
          gen1: 'Gen 1 Bonus',
          gen2: 'Gen 2 Bonus',
          gen3: 'Gen 3 Bonus',
          overrides: 'Overrides Total',
          rankBonus: 'Rank Promotion Bonus',
          matchBonus: 'Matching Bonus',
          total: 'Month End Totals'
          // grandTotal: 'Grand Total',
        }
      }
    }
  }
}
</script>

<style scoped>
.alternate-row:nth-child(odd){
  background-color: #d2d2d2;
}
.slim-row {
  padding-top: 0;
  padding-bottom: 0;
}
</style>
