<template>
  <div
    style="height: calc(100vh - 128px);"
    class="mt-5 px-3"
  >
    <v-row justify="space-around mb-5">
      <v-col cols="12">
        <v-data-table
          :headers="possibleReportsHeaders"
          :items="possibleReports"
          hide-actions
          class="elevation-1"
        >
          <template v-slot:item.actions="{ item }">
            <v-icon @click="handleRunClick(item)">
              play_circle
            </v-icon>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-row justify="space-around mb-5">
      <v-col cols="12">
        <v-data-table
          :headers="resultsHeaders"
          :items="reportResults"
          hide-actions
          class="elevation-1"
        >
          <template v-slot:item.actions="{ item }">
            <v-icon @click="handleRunClick(item)">
              play_circle
            </v-icon>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapGetters } from 'vuex'
import PeriodSwitcher from '@/components/PeriodSwitcher.vue'
import Flag from '@/components/Flag.vue'

export default {
  name: 'Reports',
  components: {
    PeriodSwitcher,
    Flag
  },
  data () {
    const resultsHeaders = [
      { text: 'Dynamic Result Name!', value: 'name' },
      { text: 'Dynamic Result Type!', value: 'type' },
      { text: 'Dynamic Result Report Details', value: 'details' }
    ]

    const possibleReportsHeaders = [
      { text: 'Report Name', value: 'name' },
      { text: 'Type', value: 'type' },
      { text: 'Report Details', value: 'details' },
      { text: 'Actions', value: 'actions' }
    ]

    const possibleReports = [
      {
        name: 'Report 1',
        type: 'standard',
        details: 'None'
      }
    ]

    const reportResults = [
      {
        name: 'Report 1',
        type: 'standard',
        details: 'None'
      }
    ]

    return {
      GET: _.get,
      resultsHeaders,
      possibleReportsHeaders,
      possibleReports,
      reportResults
    }
  },
  methods: {
    handleRunClick (item) {
      console.log({ item })
    }
  },
  computed: {
    ...mapGetters(['memberId'])
  }
}
</script>

<style scoped>
.the-grid {
  border: 1px solid black;
  width: 135px;
  margin: 3px auto;
}
.the-grid .bottom-border {
  border-bottom: 1px solid black;
}
.the-grid .right-border {
  border-right: 1px solid black;
}
.the-grid .grid-cell {
  padding: 2px 5px;
  background-color: #ef5350;
  background-clip: padding-box;
}
.the-grid .grid-cell.satisfied {
  background-color: #4caf50;
}
.button-fix {
  margin-top: -12px;
}
.tiny-font {
  font-size: 11px;
}
.mrn {
  position: absolute;
  background-color: rgb(161, 33, 59);
  color: white;
  line-height: 15px;
  font-weight: bold;
  bottom: -3px;
  right: 65%;
  min-width: 35px;
  font-size: 12px;
  padding: 1px 3px;
  text-align: center;
}
</style>
