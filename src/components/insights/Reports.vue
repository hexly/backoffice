<template>
  <div
    style="height: calc(100vh - 128px);"
    class="mt-3 px-3"
  >
    <v-row justify="space-around">
      <v-col cols="12">
        <PossibleReportsTable
          :possibleReportsHeaders="possibleReportsHeaders"
          :possibleReports="possibleReports"
          :loading="loading"
          @runClick="handleRunClick"
        />
      </v-col>
    </v-row>
    <v-row justify="space-around">
      <v-col cols="12">
        <ReportResultsTable
          :resultsHeaders="resultsHeaders"
          :reportResults="reportResults"
          :downloadURL="downloadURL"
          @downloadClicked="handleDownloadClick"
        />
      </v-col>
    </v-row>
    <ReportsDialog
      :showRunningDialog="showRunningDialog"
      :reportTitle="selectedReportTitle"
      :running="running"
      :reportParams="reportParams"
      @closeDialog="showRunningDialog = false"
      @runConfirm="handleRunConfirm"
      @updateParams="newVal => reportParams = newVal"
    />
    <v-snackbar v-model="showSnackbar">
      {{snackbarText}}
      <v-btn
        text
        color="primary"
        @click.native="showSnackbar = false"
      >Close</v-btn>
    </v-snackbar>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapGetters } from 'vuex'
import ReportsDialog from '@/components/insights/ReportsDialog'
import ReportResultsTable from '@/components/insights/ReportResultsTable'
import PossibleReportsTable from '@/components/insights/PossibleReportsTable'
import { RUN_REPORT, GET_REPORTS } from '@/components/insights/insights.gql'

export default {
  name: 'Reports',
  components: {
    ReportsDialog,
    PossibleReportsTable,
    ReportResultsTable
  },
  data () {
    const possibleReportsHeaders = [
      { text: 'Report Name', value: 'name' },
      { text: 'Report Description', value: 'description' },
      { text: 'Actions', value: 'actions' }
    ]

    return {
      GET: _.get,
      resultsHeaders: null,
      possibleReportsHeaders,
      reportResults: null,
      showRunningDialog: false,
      selectedReportTitle: null,
      loading: false,
      running: false,
      reportParams: null,
      downloadURL: null,
      showSnackbar: false,
      snackbarText: null
    }
  },
  methods: {
    handleRunClick (item) {
      console.log({ item })
      if (!item) {
        console.warn('"item" required for function handleRunClick!')
        return
      }

      this.reportParams = item.parameters
      this.showRunningDialog = true
      this.selectedReportTitle = item.name
    },
    async handleRunConfirm () {
      this.reportResults = null
      this.running = true
      const params = this.reportParams

      try {
        const res = await this.$apollo.mutate({
          mutation: RUN_REPORT,
          variables: {
            input: {
              id: 1,
              params
            }
          },
          client: 'federated'
        })

        const sample = _.get(res, 'data.bi.reporting.run.sample', [])
        this.resultsHeaders = this.generateHeadersFromSample(sample)
        this.reportResults = sample
        this.downloadURL = _.get(res, 'data.bi.reporting.run.processUrl')
        this.showRunningDialog = false

        this.snackbarText = `${this.selectedReportTitle} Successfully Run!`
        this.showSnackbar = true
      } catch (error) {
        this.snackbarText = 'There Was an Error Running Your Report! Please Try Again or Contact Support'
        this.showSnackbar = true
        console.error(error)
      }

      this.running = false
    },
    generateHeadersFromSample (sample) {
      const sampleKeys = Object.keys(sample[0])
      const headers = sampleKeys.map(key => {
        return {
          text: key,
          value: key
        }
      })
      return headers
    },
    handleDownloadClick () {
      const { downloadURL } = this
      if (!downloadURL) {
        console.warn('this.downloadURL was null in handleDownloadClick!')
        return
      }

      window.open(this.downloadURL, '_blank')
    }
  },
  computed: {
    ...mapGetters(['memberId'])
  },
  apollo: {
    possibleReports: {
      query: GET_REPORTS,
      variables: {
        input: {}
      },
      watchLoading (isLoading) {
        this.loading = isLoading
      },
      update (data) {
        const reports = _.get(data, 'reports')
        return reports
      }
    }
  }
}
</script>
