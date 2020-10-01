<template>
  <tr class="sale-row">
    <td>
      {{ award.details }}
      <br/>
      {{ award.awardedDate }}
    </td>

    <td>
      <div v-if="billing">
        {{ billing.firstName }}
        {{ billing.lastName}}
        ({{ customerOid }})
      </div>
      <div v-else>
        No Customer Information Available ({{ customerOid }})
      </div>
    </td>

    <td class="outter-hover" v-for="sc in statColumns" :key="sc.metric">
      <v-hover>
      <template v-slot:default="{ hover }">
        <div class="inner-hover">
          <v-card-text>
            {{ sc.value }}
          </v-card-text>
          <v-fade-transition>
            <v-overlay
              v-if="hover"
              absolute
              color="#036358"
            >
              {{ sc.codex ? sc.codex.hint : `Unknown decisioning code: ${sc.code}`}} <br>
              {{ Math.round(sc.modifier * 100.0, 2) }}% Contributed
            </v-overlay>
          </v-fade-transition>
        </div>
      </template>
    </v-hover>
    </td>

    <td :colspan="statColumns.length - headers.length - 2">

    </td>
  </tr>
</template>

<script>

const MAPPING = {
  metrics: [{
    label: 'Personal',
    metric: 'pv',
    decisioningMetric: 'personal',
    decisioningModifier: 'personalModifier'
  },
  {
    label: 'Group',
    metric: 'gv',
    decisioningMetric: 'group',
    decisioningModifier: 'groupModifier'
  },
  {
    label: 'Downline',
    metric: 'dlv',
    decisioningMetric: 'downline',
    decisioningModifier: 'downlineModifier'
  },
  {
    label: 'Generation',
    metric: 'genv',
    decisioningMetric: 'generation',
    decisioningModifier: 'generationModifier'
  }
  ],
  reasons: {
    award_chain_intact: {
      hint: 'Eligible upline'
    },
    award_chain_broken: {
      hint: 'Downline Broke Away'
    },
    personally_carry_over_breakaway: {
      hint: 'Broken Away'
    },
    direct_enrollee_carry_over_breakaway: {
      hint: 'Broken Away'
    },
    immediate_enrollee_award: {
      hint: 'Front Line Recruit Awarded'
    },
    personal_award: {
      hint: 'Personal Award'
    }
  }
}

export default {
  props: {
    headers: Array,
    award: Object
  },
  data() {
    return {
      hover: false
    }
  },
  computed: {
    statColumns() {
      return this.headers
        .filter(h => ['pv', 'gv', 'dlv', 'genv'].indexOf(h.value) >= 0)
        .map(h => {
          const value = this._.get(this.award, h.value)

          const mapping = MAPPING.metrics.find(e => e.metric === h.value)

          const { decisioningMetric, decisioningModifier, label, metric } = mapping || {}
          const d = this._.get(this.award, 'metadata.decisioning')
          const code = this._.get(d, [decisioningMetric, 'decisionCode'])
          const modifier = this._.get(d, [decisioningMetric, decisioningModifier])

          const codex = MAPPING.reasons[code]
          console.log(this, codex)

          return {
            label,
            metric,
            mapping,
            code,
            codex,
            modifier,
            value: value && value.totalPoints ? value.totalPoints : value
          }
        })
    },
    billing() {
      const billing = this._.get(this.award, 'metadata.billing')
      return billing
    },
    customerOid() {
      return this._.get(this.award, 'metadata.customerOid') || 'GUEST'
    }
    // decisioning() {
    //   const d = this._.get(this.award, 'metadata.decisioning')

    //   const metrics = this.statColumns.map(sc => {
    //     const { label, metric } = sc
    //     const { decisioningMetric, decisioningModifier } = sc.mapping || {}

    //     const code = this._.get(d, [decisioningMetric, 'decisionCode'])
    //     const modifier = this._.get(d, [decisioningMetric, decisioningModifier])

    //     const stat = {
    //       label, metric, code, modifier
    //     }

    //     console.log(sc, this._.get(d, [decisioningMetric, decisioningModifier]))
    //     return stat
    //   })

    //   return {
    //     metrics
    //   }
    // }
  }
}
</script>

<style scoped>
.sale-row{
  background-image: linear-gradient(147deg, #ffffff 25%, #fafafa 25%, #fafafa 50%, #ffffff 50%, #ffffff 75%, #fafafa 75%, #fafafa 100%);
  background-size: 73.44px 47.69px;
  background-repeat: repeat;
}

.outter-hover {
  position: relative
}
.inner-hover {
  display: block;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
