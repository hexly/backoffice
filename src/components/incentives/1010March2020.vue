<template>
  <div>
    <v-card id="power-seller-incentive">
      <v-toolbar color="secondary" dark>
        <v-toolbar-title>Power Seller Promotion</v-toolbar-title>
        <v-spacer></v-spacer>
        <span>March 17 - April 30</span>
      </v-toolbar>
      <v-card-text>
        <div v-if="!current || !current.current">
          <v-progress-circular indeterminate :size="30" :width="3" color="grey"></v-progress-circular>
        </div>
        <div v-else>
          <div>
            <div class="subtitle-1">Active Influencers who personally achieve a Power Seller Bonus will receive an additional Product Credit.</div>
          </div>
          <v-row>
            <v-col class="text-center">
              <h4>$25/£22</h4>
              <v-progress-circular
                :rotate="270"
                :size="100"
                :value="(current.current.stats.personalTotalPoints.earned/250) * 100"
                :width="15"
                color="green lighten-3"
              >
                <div>250 PSV</div>
              </v-progress-circular>
              <h6><sup>*</sup>Additional 5%</h6>
            </v-col>
            <v-col class="text-center">
              <h4>$50/£44</h4>
              <v-progress-circular
                :rotate="270"
                :size="100"
                :value="(current.current.stats.personalTotalPoints.earned/500) * 100"
                :width="15"
                color="green lighten-2"
              >
                <div>500 PSV</div>
              </v-progress-circular>
              <h6><sup>*</sup>Additional 10%</h6>
            </v-col>
            <v-col class="text-center">
              <h4>$100/£88</h4>
              <v-progress-circular
                :rotate="270"
                :size="100"
                :value="(current.current.stats.personalTotalPoints.earned/1000) * 100"
                :width="15"
                color="green lighten-1"
              >
                <div>1000 PSV</div>
              </v-progress-circular>
              <h6><sup>*</sup>Additional 15%</h6>
            </v-col>
            <v-col class="text-center">
              <h4>$200/£176</h4>
              <v-progress-circular
                :rotate="270"
                :size="100"
                :value="(current.current.stats.personalTotalPoints.earned/2000) * 100"
                :width="15"
                color="green"
              >
                <div>2000 PSV</div>
              </v-progress-circular>
              <h6><sup>*</sup>Additional 20%</h6>
            </v-col>
          </v-row>
          <div class="text-right">
            <small><sup>*</sup>Power Seller Monthly Bonus</small>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'EverraMarch2020Incentive',
  computed: {
    ...mapState({
      current: state => state.comp.currentPeriod
    })
  }
}
</script>

<style>
#power-seller-incentive .v-progress-circular__info{
  flex-direction: column;
}
</style>
