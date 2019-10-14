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
          <component :is="i.key" :details="i" @create="createIntegration" :ref="i.key" :error="errors[i.key]"/>
        </v-tab-item>

      </v-tabs>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import xomly from '@/components/integrations/xomly.vue'
import paychex from '@/components/integrations/paychex.vue'
import stripe_connect from '@/components/integrations/stripe.vue'
import { CREATE_MEMBER_INTEGRATION } from '@/graphql/Integrations'
import { UserMutations } from '@/stores/UserStore'

export default {
  name: 'IntegrationsView',
  components: {
    xomly,
    paychex,
    stripe_connect
  },
  data() {
    return {
      errors: {
        paychex: null,
        xomly: null,
        stripe: null
      },
      icons: {
        paychex: {
          type: 'icon',
          value: 'attach_money'
        },
        stripe_connect: {
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
  methods: {
    ...mapMutations({
      addIntegration: UserMutations.ADD_INTEGRATION
    }),
    async createIntegration({ command, tenantIntegrationId, data }) {
      this.errors[command] = null
      try {
        await this.$apollo.mutate({
          mutation: CREATE_MEMBER_INTEGRATION,
          variables: {
            input: {
              command,
              tenantIntegrationId,
              data
            }
          },
          update: (store, { data }) => {
            this.addIntegration({ ...data, key: command })
            this.$refs[command][0].reload()
          }
        })
      } catch (e) {
        const { graphQLErrors } = e
        this.errors[command] = graphQLErrors[0].message
      }
    }
  },
  computed: {
    ...mapState({
      integrations: state => state.user.principal.tenant.integrations,
      activeIntegrations: state => state.integrations,
      memberId: state => state.user.principal.member.id
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
