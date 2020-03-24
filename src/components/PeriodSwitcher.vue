<template>
  <div>
    <small>{{selectedPeriod && selectedPeriod.name}}</small>
    <v-menu v-model="menu" v-if="!readOnly">
      <template v-slot:activator="{ on }">
        <v-btn icon v-on="on">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>
      <v-card>
        <v-list subheader dense>
          <template v-if="periods.open">
            <v-subheader>Current Period</v-subheader>
            <v-list-item v-for="period in periods.open" :key="period.id" @click="periodChanged(period)">
              <v-list-item-icon>
                <v-icon v-if="selectedPeriod && period.id === selectedPeriod.id" color="pink">mdi-star</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{period.name}}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
          <template v-if="periods.under_review">
            <v-subheader>Under Review</v-subheader>
            <v-list-item v-for="period in periods.under_review" :key="period.id" @click="periodChanged(period)">
              <v-list-item-icon>
                <v-icon v-if="selectedPeriod && period.id === selectedPeriod.id" color="pink">mdi-star</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{period.name}}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
          <template v-if="periods.closed">
            <v-subheader>Past Periods</v-subheader>
            <v-list-item v-for="period in periods.closed" :key="period.id" @click="periodChanged(period)">
              <v-list-item-icon>
                <v-icon v-if="selectedPeriod && period.id === selectedPeriod.id" color="pink">mdi-star</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{period.name}}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
          </v-list>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
import { CompActions } from '@/stores/CompStore'
import { mapState, mapActions } from 'vuex'
export default {
  name: 'PeriodSwitcher',
  props: {
    readOnly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      menu: false
    }
  },
  methods: {
    periodChanged(period) {
      this.compSelectPeriod(period)
    },
    ...mapActions([CompActions.SELECT_PERIOD])
  },
  computed: {
    ...mapState({
      periods: state => state.comp.periods,
      selectedPeriod: state => state.comp.selectedPeriod
    })
  }
}
</script>

<style scoped>

</style>
