<template>
  <div>
    <template v-if="payouts">
      <p class="body-1">Here is a breakdown of the month end payout you received for the selected period you are viewing.</p>
      <v-row v-for="(value, key) in mapping" :key="key" class="alternate-row">
        <v-col cols="6" class="body-2">
          {{value}}
        </v-col>
        <v-col cols="6" class="text-right body-1">
          <strong>
            <Currency :amount="payouts[key]" />
          </strong>
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
        personal: 'Personal Sales',
        powerSeller: 'Power Seller Bonus',
        fssb: 'Fast Start Sponsor Bonus',
        level1: 'Level 1 Bonus',
        level2: 'Leve 2 Bonus',
        level3: 'Level 3 Bonus',
        group: 'Group Bonus',
        gen1: 'Gen 1 Bonus',
        gen2: 'Gen 2 Bonus',
        gen3: 'Gen 3 Bonus',
        rankBonus: 'Rank Promotion Bonus',
        matchBonus: 'Matching Bonus',
        total: 'Total'
        // grandTotal: 'Grand Total',
        // overrides: 'Overrides'
      }
    }
  }
}
</script>

<style scoped>
.alternate-row:nth-child(odd){
  background-color: #d2d2d2;
}
</style>
