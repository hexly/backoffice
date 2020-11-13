<template>
  <div>
    <template v-if="earnings">
      <p class="body-1">Here is a breakdown of the month end payout you received for the selected period you are viewing.</p>
      <v-row>
        <v-divider/>
      </v-row>
      <v-row v-for="earning in earnings.earnings" :key="earning.key" class="pa-0">
        <v-col cols="6">
          <h3>{{earning.description}}</h3>
        </v-col>
        <v-col cols="6" class="text-right body-1">
          <strong>
            <Currency :amount="(earning.earning || 0)/earning.currencyModifier" :currency="earning.currencyKey"/>
          </strong>
        </v-col>
      </v-row>
      <v-row>
        <v-divider/>
      </v-row>
      <v-row class="pa-0">
        <v-col class="body-2" cols="6">
          <h3>Total Month End Bonuses</h3>
        </v-col>
        <v-col cols="6" class="text-right body-1">
          <strong><Currency :amount="(earnings.payout || 0)/earnings.currencyModifier" :currency="earnings.currency"/></strong>
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
    earnings: Object
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
          powerSeller: 'Power Seller Bonus',
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
