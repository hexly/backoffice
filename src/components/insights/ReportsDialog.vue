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
      <v-card-text>
        <v-form ref="form">
          <v-textarea
            v-model="_reportParams"
            label="Report Parameters"
            rows="1"
            :rules="[jsonChecker]"
          ></v-textarea>
        </v-form>
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
export default {
  name: 'ReportsDialog',
  props: {
    showRunningDialog: Boolean,
    reportTitle: String,
    running: Boolean,
    reportParams: String
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
  }
}
</script>
