<template>
  <div class="pa-4">
    <div>
      <h2>Store Personalization</h2>
      Let your store reflect your unique persona! Choose which homepage best represents your brand, and your customers will be shown that selected home page when they visit.
      <v-row>
        <v-col cols="6" sm="3" md="3" v-for="option in options" :key="option.key" class="text-sm-center">
          {{option.name}}
          <v-img :src="option.img" max-width="250" class="image"/>
          <v-switch
            class="switch"
            :disabled="saving"
            v-model="selected"
            @change="updateSelected"
            :label="selected.indexOf(option.key) ? 'Select' : 'Selected'"
            color="primary"
            :value="option.key"
            hide-details
          ></v-switch>
          <a :href="`${baseUrl}/store/${slug}?altHomepage=${option.key}`" target="_blank">Preview</a>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { UPSERT_MEMBER_TENANT_INTEGRATION } from '@/graphql/Integrations'

const personalizedStoreKey = 'hexly_personalized_store'
export default {
  name: 'ProfileSettings',
  data() {
    return {
      saving: false,
      selected: []
    }
  },
  mounted() {
    const selectedOption = this.tenantIntegrations.find(i => i.key === personalizedStoreKey)
    if (selectedOption) {
      const { theme } = selectedOption.metadata.home
      this.selected = [theme]
    } else {
      this.selected = [this.default.key]
    }
  },
  methods: {
    async updateSelected(keys) {
      this.saving = true
      const key = keys.pop()
      await this.saveIntegration(key)
      this.selected = [key]
      this.saving = false
    },
    async saveIntegration(key) {
      let selectedOption = this.tenantIntegrations.find(i => i.key === personalizedStoreKey)
      const selectedOpt = {
        id: selectedOption ? selectedOption.id : null,
        tenantIntegrationId: this.integration.id,
        metadata: {
          home: {
            theme: key
          }
        },
        priority: 0
      }
      const toSave = { ...selectedOpt }
      await this.$apollo.mutate({
        mutation: UPSERT_MEMBER_TENANT_INTEGRATION,
        variables: {
          input: {
            integrations: [toSave]
          }
        }
      })
    }
  },
  computed: {
    baseUrl() {
      return this.integration.metadata.baseUrl
    },
    options() {
      return this.integration.metadata.options
    },
    integration() {
      const storeOptions = this.integrations.find(i => i.key === personalizedStoreKey)
      console.log(storeOptions)
      return storeOptions
    },
    default() {
      return this.options.find(i => i.default)
    },
    ...mapGetters(['contactId', 'tenantIntegrations', 'integrations', 'slug'])
  }
}
</script>

<style scoped>
.image {
  margin: auto;
}
.switch {
  width: 100px;
  margin: auto;
}
</style>
