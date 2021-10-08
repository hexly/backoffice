<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <v-toolbar-title>Recent Team Sales</v-toolbar-title>
    </v-toolbar>
    <v-list three-line v-if="sales[0]">
      <v-list-item v-for="sale in sales" :key="sale.integrationOid" class="alternate-row">
        <v-list-item-avatar>
          <v-img v-if="sale.awardee.avatar" :src="sale.awardee.avatar.assetUrl"></v-img>
          <v-img v-else :src="$tenantInfo.placeholder"></v-img>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title>{{sale.awardee.displayName}}</v-list-item-title>
          <v-list-item-subtitle style="font-size: 12px !important;">
            Order Id: {{sale.integrationOid}}
            <br/>
            <a :href="`mailto: ${sale.awardee.contacts[0].emails[0].email}`"> {{sale.awardee.contacts[0].emails[0].email}}</a>
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <v-list-item-action-text>{{$moment(sale.awardedDate,'YYYY-MM-DD').format('ll')}}</v-list-item-action-text>
          <v-list-item-action-text>Points: {{sale.stats.totalPoints}}</v-list-item-action-text>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <div class="heading text-center pa-3" v-else>No Data</div>
    <v-pagination
      v-if="totalResults > pageSize"
      class="pb-1 mb-1"
      v-model="page"
      :length="Math.ceil(totalResults/pageSize)"
    ></v-pagination>
  </v-card>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { GET_TEAM_SALES } from '@/components/insights/insights.gql'

export default {
  name: 'TeamSalesOverview',
  data() {
    return {
      sales: [],
      page: 1,
      pageSize: 15,
      totalResults: 0
    }
  },
  apollo: {
    sales: {
      query: GET_TEAM_SALES,
      variables() {
        return {
          input: {
            memberId: this.memberId,
            periodId: 19, // this.selectedPeriod.id,
            page: this.page,
            pageSize: this.pageSize
          }
        }
      },
      update({ engine }) {
        const { getTeamAttributions: { totalResults, results } } = engine
        this.totalResults = totalResults
        return results
      },
      client: 'federated'
    }
  },
  computed: {
    ...mapGetters(['memberId']),
    ...mapState({
      selectedPeriod: state => state.comp.selectedPeriod
    })
  }
}
</script>

<style scoped>
.alternate-row:nth-child(odd){
  background-color: #d2d2d2;
  margin-bottom: -5px;
  margin-top: -5px;
}
</style>
