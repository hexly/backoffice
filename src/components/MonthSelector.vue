<template>
  <div>
    <v-flex
      xs11
      sm5
    >
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
        max-width="290px"
        min-width="290px"
      >
        <v-text-field
          slot="activator"
          v-model="formattedDate"
          label="Choose Month"
          prepend-icon="event"
          readonly
        ></v-text-field>
        <v-date-picker
          v-model="date"
          type="month"
          :max="maxDate"
          :min="minDate"
          no-title
          scrollable
        >
          <v-spacer></v-spacer>
          <v-btn
            flat
            color="primary"
            @click="menu = false"
          >Cancel</v-btn>
          <v-btn
            flat
            color="primary"
            @click="updateDate"
          >OK</v-btn>
        </v-date-picker>
      </v-menu>
    </v-flex>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'month-selector',
  data () {
    return {
      date: null,
      formattedDate: null,
      menu: false,
      maxDate: moment().format(),
      moment
    }
  },
  mounted () {
    this.date = `${this.year}-${this.month}`
    this.formattedDate = moment(this.date).format('MMMM YYYY')
  },
  props: {
    month: {
      type: [Number, String],
      default: new Date().getMonth() + 1
    },
    year: {
      type: [Number, String],
      default: new Date().getFullYear()
    },
    minDate: {
      type: [Number, String],
      default: null
    }
  },
  methods: {
    updateDate () {
      this.$refs.menu.save(this.date)
      this.formattedDate = moment(this.date).format('MMMM YYYY')
      this.$emit('date-changed', {
        date: this.date
      })
    }
  }
}
</script>

<style scoped>
</style>
