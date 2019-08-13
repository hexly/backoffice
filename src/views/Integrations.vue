<template>
  <div class="integrations text-xs-center">
      <v-tabs centered color="secondary" dark icons-and-text>
        <v-tabs-slider color="white"></v-tabs-slider>

        <v-tab v-for="i in availableIntegrations" :to="`#${i.key}`" :key="i.key">
          {{i.name}}
          <template v-if="icons[i.key].type === 'icon'">
            <v-icon>{{icons[i.key].value}}</v-icon>
          </template>
          <template v-else-if="icons[i.key].type === 'image'">
            <img class="tab-image" :src="icons[i.key].value"/>
          </template>
        </v-tab>

        <v-tab-item v-for="i in availableIntegrations" :value="i.key" :key="i.key" class="py-3">
          <component :is="i.key" :details="i"/>
        </v-tab-item>

      </v-tabs>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import xomly from '@/components/integrations/xomly.vue'
import paychex from '@/components/integrations/paychex.vue'

export default {
  name: 'IntegrationsView',
  components: {
    xomly,
    paychex
  },
  data() {
    return {
      icons: {
        paychex: {
          type: 'icon',
          value: 'attach_money'
        },
        xomly: {
          type: 'image',
          value: '/img/integrations/xomly-logo.svg'
        }
      }
    }
  },
  computed: {
    ...mapState({
      integrations: state => state.user.principal.tenant.integrations,
      activeIntegrations: state => state.integrations
    }),
    availableIntegrations() {
      return this.integrations.filter(i => {
        return this.activeIntegrations.indexOf(i.key) > -1 && i.statusId === 200
      })
    }
  }
}
</script>

<style scoped>
.tab-image{
  width: 20px;
  margin-bottom: 5px;
}
</style>
