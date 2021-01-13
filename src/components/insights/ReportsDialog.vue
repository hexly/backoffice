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
        <v-form>
          <v-text-field
            readonly
            label="Dynamic Params HERE!"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn @click="$emit('closeDialog')">cancel</v-btn>
        <v-btn
          :disabled="running"
          :loading="running"
          @click="$emit('runConfirm')"
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
    running: Boolean
  },
  computed: {
    _showRunningDialog: {
      get () {
        return this.showRunningDialog
      },
      set () {
        this.$emit('closeDialog')
      }
    }
  }
}
</script>
