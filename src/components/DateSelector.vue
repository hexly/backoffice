<template>
  <div>
    <v-flex xs11 sm5>
      <v-menu
        ref="menu"
        :close-on-content-click="false"
        v-model="menu"
        :nudge-right="40"
        :return-value.sync="date"
        lazy
        transition="scale-transition"
        offset-y
        full-width
        min-width="290px"
      >
        <v-text-field
          slot="activator"
          v-model="date"
          :label="label"
          prepend-icon="event"
          @change="parseDate"
          readonly
        ></v-text-field>
        <v-date-picker v-model="date" @input="updateDate"></v-date-picker>

      </v-menu>
    </v-flex>
  </div>
</template>

<script>
import moment from 'moment'
export default {
  name: 'date-selector',
  data () {
    return {
      date: null,
      menu: false,
      modal: false
    }
  },
  mounted () {
    this.date = this.selectedDate
  },
  props: {
    selectedDate: {
      type: String,
      default: moment().format('YYYY-MM-DD')
    },
    label: {
      type: String,
      default: 'Select Month'
    }
  },
  methods: {
    updateDate () {
      this.$refs.menu.save(this.date)
      this.$emit('date-changed', {
        date: this.date
      })
    },
    parseDate (d) {
      console.log('parseDate', d)
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    }
  }
}
</script>
