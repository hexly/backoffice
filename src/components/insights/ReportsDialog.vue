<template>
  <v-dialog
    v-model="_showRunningDialog"
    persistent
    max-width="500px"
  >
    <v-card>
      <v-toolbar
        color="primary white--text"
        class="mb-5"
      >
        <v-toolbar-title v-if="reportTitle">
          Run {{reportTitle}}
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text v-if="reportParams">
        <v-form ref="form">
          <div
            v-for="(param, i) in reportParams"
            :key="param.name"
          >
            <v-text-field
              v-model="reportParamsModel[i]"
              :label="param.name"
              :rules="[v => (param.implicit || !!v) || 'Required Field']"
              v-if="param.key !== '__tenantId'"
            ></v-text-field>
            <div
              class="text-center"
              v-else-if="reportParams.length === 1"
            >No Parameters Required</div>
          </div>
        </v-form>
        <div
          v-if="reportParams.length === 0"
          class="text-center"
        >No Parameters Required</div>
      </v-card-text>
      <v-card-actions class="justify-center pb-4">
        <v-btn
          class="mr-2 primary lighten-1 white--text"
          @click="$emit('closeDialog')"
        >cancel</v-btn>
        <v-btn
          class="primary lighten-1 white--text"
          :disabled="running"
          :loading="running"
          @click="handleConfirmClick"
        >confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import * as _ from 'lodash'

export default {
  name: 'ReportsDialog',
  data () {
    return {
      reportParamsModel: []
    }
  },
  props: {
    showRunningDialog: Boolean,
    reportTitle: String,
    running: Boolean,
    reportParams: Array
  },
  methods: {
    jsonChecker (v) {
      try {
        JSON.parse(v)
        return true
      } catch (error) {
        console.warn(error)
        return error.message
      }
    },
    handleConfirmClick () {
      const { form } = this.$refs

      if (!form) {
        console.warn('"form" not found in $refs!')
        return
      }

      if (!form.validate()) {
        return
      }

      this.$emit('runConfirm')
    }
  },
  watch: {
    reportParams (newVal) {
      const length = _.get(this, 'reportParams.length', 0)
      this.reportParamsModel = new Array(length)
    }
  },
  computed: {
    _showRunningDialog: {
      get () {
        return this.showRunningDialog
      },
      set () {
        this.$emit('closeDialog')
      }
    },
    _reportParams: {
      get () {
        return this.reportParams
      },
      set (newVal) {
        this.$emit('updateParams', newVal)
      }
    }
  },
  mounted () {
    const length = _.get(this, 'reportParams.length', 0)
    this.reportParamsModel = new Array(length)
  }
}
</script>
