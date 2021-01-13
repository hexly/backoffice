<template>
  <div
    style="height: calc(100vh - 128px);"
    class="mt-5 px-3"
  >
    <v-row justify="space-around">
      <v-col cols="12">
        <PossibleReportsTable
          :possibleReportsHeaders="possibleReportsHeaders"
          :possibleReports="possibleReports"
          @runClick="handleRunClick"
        />
      </v-col>
    </v-row>
    <v-row justify="space-around">
      <v-col cols="12">
        <ReportResultsTable
          :resultsHeaders="resultsHeaders"
          :reportResults="reportResults"
          @downloadClicked="handleDownloadClick"
        />
      </v-col>
    </v-row>
    <ReportsDialog
      :showRunningDialog="showRunningDialog"
      :reportTitle="selectedReportTitle"
      :running="running"
      @closeDialog="showRunningDialog = false"
      @runConfirm="handleRunConfirm"
    />
  </div>
</template>

<script>
import _ from 'lodash'
import { mapGetters } from 'vuex'
import ReportsDialog from '@/components/insights/ReportsDialog'
import ReportResultsTable from '@/components/insights/ReportResultsTable'
import PossibleReportsTable from '@/components/insights/PossibleReportsTable'
import { RUN_REPORT } from '@/components/insights/insights.gql'

export default {
  name: 'Reports',
  components: {
    ReportsDialog,
    PossibleReportsTable,
    ReportResultsTable
  },
  data () {
    // const resultsHeaders = [
    //   { text: 'Dynamic Result Name!', value: 'name' },
    //   { text: 'Dynamic Result Type!', value: 'type' },
    //   { text: 'Dynamic Result Report Details', value: 'details' }
    // ]

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

    // Todo: const sampleParams = ... for dynamic params showing in the dialog

    // const reportResults = [
    //   {
    //     name: 'Report 1',
    //     type: 'standard',
    //     details: 'None'
    //   }
    // ]

    return {
      GET: _.get,
      resultsHeaders: null,
      possibleReportsHeaders,
      possibleReports,
      reportResults: null,
      showRunningDialog: false,
      selectedReportTitle: null,
      running: false
    }
  },
  methods: {
    handleRunClick (item) {
      this.showRunningDialog = true
      this.selectedReportTitle = item.name
    },
    async handleRunConfirm () {
      try {
        this.reportResults = null
        this.running = true
        const res = await this.$apollo.mutate({
          mutation: RUN_REPORT,
          variables: {
            input: {
              id: 1,
              params: [
                { key: 'foobar', value: 123 }
              ]
            }
          },
          client: 'federated'
        })

        const sample = _.get(res, 'data.bi.reporting.run.sample', [])
        this.resultsHeaders = this.generateHeadersFromSample(sample)
        this.reportResults = sample
        this.showRunningDialog = false
      } catch (error) {
        console.error(error)
      }

      this.running = false
      console.log('runConfirm!')
    },
    generateHeadersFromSample (sample) {
      const sampleKeys = Object.keys(sample[0])
      console.log({ sample, sampleKeys })
      const headers = sampleKeys.map(key => {
        return {
          text: key,
          value: key
        }
      })
      return headers
    },
    handleDownloadClick () {
      console.log('Download Clicked!')
    }
  },
  computed: {
    ...mapGetters(['memberId'])
  }
}
</script>
