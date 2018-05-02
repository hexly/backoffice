<template>
  <div>
    <v-select
      :items="availableMonths"
      v-model="selectedMonth"
      label="Month"
      single-line
      @change="monthChanged"
    ></v-select>
    <v-select
      :items="availableYears"
      v-model="selectedYear"
      label="Year"
      single-line
      @change="yearChanged"
    ></v-select>
  </div>
</template>

<script>
import range from 'rambda/lib/range'
import { nextTick } from 'async'
export default {
  name: 'date-selector',
  data() {
    const currentYear = new Date().getFullYear()
    const lastYear = currentYear - 1
    const nextYear = currentYear + 1
    const availableMonths = range(0, 12).map(m => {
      const date = new Date()
      date.setMonth(m)
      return {
        value: m + 1,
        text: date.toLocaleString(this.$store.locale, { month: 'long' })
      }
    })
    return {
      selectedMonth: this.month,
      selectedYear: this.year,
      availableMonths,
      availableYears: [
        {
          value: lastYear,
          text: lastYear
        },
        {
          value: currentYear,
          text: currentYear
        },
        {
          value: nextYear,
          text: nextYear
        }
      ]
    }
  },
  props: {
    month: {
      type: Number,
      default: new Date().getMonth() + 1
    },
    year: {
      type: Number,
      default: new Date().getFullYear()
    }
  },
  methods: {
    monthChanged(date) {
      this.$emit('date-changed', {
        dateType: 'month',
        date
      })
    },
    yearChanged(date) {
      this.$emit('date-changed', {
        dateType: 'year',
        date
      })
    }
  }
}
</script>

<style scoped>

</style>
