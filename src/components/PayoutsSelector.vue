<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        style="float: right;"
        text
        large
        class="text-right settings-btn"
        color="black"
        v-bind="attrs"
        v-on="on"
      >
        Settings <v-icon>settings</v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-toolbar
        dark
        color="primary"
      >
        <v-btn
          icon
          dark
          @click="dialog = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Settings</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn
            dark
            text
            @click="save()"
            :disabled="loading"
            :loading="loading"
          >Save</v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <div class="pa-2">
        <v-alert
          type="error"
          :value="!!error"
        >{{error}}</v-alert>
        <h3>Available Payout Systems</h3>
        <p>Please select the service you'd like to get paid through:</p>
        <v-radio-group
          v-model="selectedModel"
          @change="updateSelection"
        >
          <v-radio
            v-for="integration in integrations"
            :key="integration.id"
            :label="integration.name"
            :value="integration.key"
          ></v-radio>
        </v-radio-group>
      </div>
      <v-container v-if="selectedModel === 'paypal_payouts'">
        <h2>PayPal Setup</h2>
        <p v-if="!getMemberIntegration(selectedModel)">
          Please enter your paypal information.
          If you dont have a paypal account please go to <a href="https://www.paypal.com">https://www.paypal.com</a> and create an account.
        </p>
        <v-form>
          <v-row>
            <v-col
              cols="12"
              sm="6"
              md="3"
            >
              <v-select
                v-model="metadata.type"
                :items="settings[selectedModel].types"
                label="Paypal Id Type"
              ></v-select>
            </v-col>
            <v-col
              cols="12"
              sm="6"
              md="3"
            >
              <v-text-field
                v-model="integrationOid"
                label="Paypal Email"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script>
import _ from 'lodash'
import { UserActions } from '@/stores/UserStore'
import { UPSERT_MEMBER_TENANT_INTEGRATION } from '@/graphql/Integrations'
import { mapGetters, mapActions } from 'vuex'

export default {
  data () {
    return {
      loading: false,
      error: null,
      dialog: false,
      selectedModel: {},
      integrationOid: null,
      metadata: {},
      supportedIntegrations: {},
      settings: {
        'paypal_payouts': {
          types: ['email']
        }
      }
    }
  },
  props: {
    integrations: Array,
    selected: String
  },
  watch: {
    selected(newVal) {
      const { getPayoutCapableIntegrations, integrations } = this
      const currentIntegration = _.find(getPayoutCapableIntegrations, { key: newVal }) || _.find(integrations, { key: newVal })

      this.supportedIntegrations = _.chain(integrations).groupBy('key').mapValues(i => _.get(i, '[0].priority')).value()
      this.selectedModel = _.get(currentIntegration, 'key')
      this.integrationOid = _.get(currentIntegration, 'integrationOid')
      this.metadata = _.get(currentIntegration, 'metadata')
    }
  },
  methods: {
    ...mapActions({ reloadIntegrations: UserActions.RELOAD_INTEGRATIONS }),
    updateSelection (key) {
      const integration = this.getMemberIntegration(key)
      if (integration) {
        this.newIntegration = false
        this.integrationOid = integration.integrationOid
        this.metadata = integration.metadata
      } else {
        // New Integration
        this.newIntegration = true
        this.integrationOid = null
        this.metadata = {}
      }
    },
    async save () {
      this.loading = true
      this.error = null
      const integration = this.getIntegration(this.selectedModel)
      // Update priorities
      const integrationsToSave = this.getPayoutCapableIntegrations.map((i, index) => {
        const integration = {
          id: i.id,
          tenantIntegrationId: i.tenantIntegrationId,
          integrationOid: i.integrationOid,
          metadata: i.metadata,
          priority: i.priority
        }
        let priority = index + 1
        if (i.key === this.selectedModel) {
          priority = 0
          if (this.settings[this.selectedModel]) {
            // This integration supports user input
            integration.integrationOid = this.integrationOid
            integration.metadata = this.metadata
          }
        }
        integration.priority = priority
        return integration
      })
      const isDefault = this.supportedIntegrations[this.selectedModel] === 0
      if (this.newIntegration && !isDefault) {
        if (!this.integrationOid || (this.settings[this.selectedModel] && _.isEmpty(this.metadata))) {
          this.error = 'Please fill in all required information'
          this.loading = false
          return
        }
        const upsert = {
          tenantIntegrationId: integration.id,
          priority: 0,
          integrationOid: this.integrationOid,
          metadata: this.metadata
        }
        integrationsToSave.push(upsert)
      }
      try {
        await this.$apollo.mutate({
          mutation: UPSERT_MEMBER_TENANT_INTEGRATION,
          variables: {
            input: {
              integrations: integrationsToSave
            }
          }
        })

        await this.reloadIntegrations()

        this.$emit('reload', this.selectedModel)
        this.loading = false
        this.dialog = false
      } catch (e) {
        this.loading = false
        this.error = e.message
      }
    },
    getMemberIntegration (key) {
      return _.find(this.tenantIntegrations, ['key', key])
    },
    getIntegration (key) {
      return _.find(this.integrations, ['key', key])
    }
  },
  computed: {
    ...mapGetters(['tenantIntegrations']),
    getPayoutCapableIntegrations () {
      return this.tenantIntegrations.filter(i => {
        return _.find(this.integrations, { key: i.key })
      })
    }
  }
}
</script>

<style>
  .settings-btn {
    z-index: 1;
  }
</style>
