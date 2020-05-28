<template>
  <div>
    <p class="body-1">Here is a breakdown of the month end payout you received for the selected period you are viewing.</p>
    <v-row v-for="(value, key) in mapping" :key="key">
      <v-col cols="6">
        {{value}}
      </v-col>
      <v-col cols="6" class="text-right body-1">
        <Currency :amount="payouts[key]" />
      </v-col>
    </v-row>
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
