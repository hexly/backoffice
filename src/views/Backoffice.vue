<template>
  <div class="main">
    <v-navigation-drawer fixed v-model="drawer" app>
      <div v-if="$tenantInfo.logoPath" class="text-center">
        <img :src="$tenantInfo.logoPath" class="logo"/>
      </div>
      <v-divider></v-divider>
      <v-list dense>
        <v-list-item to="/dashboard">
          <v-list-item-action>
            <v-icon>home</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Dashboard</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="$tenantInfo.features.sales" to="/sales">
          <v-list-item-action>
            <v-icon>shopping_basket</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Sales</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="$tenantInfo.features.payouts" to="/payouts">
          <v-list-item-action>
            <v-icon>attach_money</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Payouts</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="$tenantInfo.features.insights" to="/insights">
          <v-list-item-action>
            <v-icon>insights</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Insights</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="$tenantInfo.features.rewards" to="/rewards">
          <v-list-item-action>
            <v-icon>mdi-gift</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Rewards</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <!-- <v-list-item to="/assets">
          <v-list-item-action>
            <v-icon>perm_media</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Assets</v-list-item-title>
          </v-list-item-content>
        </v-list-item>-->
        <v-list-item v-if="GET($tenantInfo, 'features.team.base', true)" to="/team">
          <v-list-item-action>
            <v-icon>people</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Team</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="$tenantInfo.features.customers" to="/customers">
          <v-list-item-action>
            <v-icon>people_outline</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Customers <sup>beta</sup></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="$tenantInfo.features.announcements" to="/announcements">
          <v-list-item-action>
            <v-icon>announcement</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Inventory</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="activeIntegrations.length" to="/integrations">
          <v-list-item-action>
            <v-icon>compare_arrows</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Integrations</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="/profile">
          <v-list-item-action>
            <v-icon>contact_mail</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Profile</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="$tenantInfo.features.files" to="/files">
          <v-list-item-action>
            <v-icon>topic</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{$tenantInfo.strings.files || 'Files'}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="/promotioncenter">
          <v-list-item-action>
            <v-icon>stars</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Promotion Center</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>
      <v-list>
        <v-list-item :href="usersStoreUrl" target="_blank">
          <v-list-item-action>
            <v-icon>store</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Shop</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="isNewInfluencer" :href="`${usersStoreUrl}/product-category/welcome-collections/`" target="_blank">
          <v-list-item-action>
            <v-icon>redeem</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title><strong class="red--text text--lighten-1">Collections <sup>New</sup></strong></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          v-for="link in $tenantInfo.externalLinks"
          :href="link.href"
          target="_blank"
          :key="link.href"
        >
          <v-list-item-action>
            <v-icon>{{link.icon || 'link'}}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{link.name}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider v-if="hasAdminMenu"></v-divider>
      <v-list v-if="hasAdminMenu">
        <v-list-item target="_blank" href="https://admin.hexly.cloud">
          <v-list-item-action>
            <v-icon>cloud_circle</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Hexly Admin</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="hasZendeskAdmin" to="/zendesk">
          <v-list-item-action>
            <v-icon>supervised_user_circle</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Zendesk Admin</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <div
        column
        class="text-center py-4 footer-wrapper"
      >
        <div class="footer">
          <div>
            <a
              v-for="social in $tenantInfo.social"
              :key="social.key"
              :href="social.url"
              target="_blank"
            >
              <img :src="`/img/social/${social.key}.svg`" />
            </a>
          </div>
          <h5 class="py-4">
            <span v-if="$tenantInfo.privacyPolicy">
              <a
                target="_blank"
                :href="$tenantInfo.privacyPolicy"
              >Privacy Policy</a> ·
            </span>
            <span>Copyright {{moment().format('YYYY')}}</span>
          </h5>
        </div>
      </div>
    </v-navigation-drawer>
    <v-app-bar :color="$tenantInfo.baseColor" dark fixed app>
      <v-app-bar-nav-icon
        v-if="$vuetify.breakpoint.mdAndDown"
        @click.stop="drawer = !drawer"
      ></v-app-bar-nav-icon>
      <v-toolbar-title class="title">{{$route.name}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-menu offset-y>
          <template v-slot:activator="{ on }">
            <v-btn text v-on="on">
              <span
                data-cy="Display Name"
                v-if="$vuetify.breakpoint.mdAndUp"
                class="pr-2"
              >{{user.isImpersonating ? impersonationPrefix + user.principal.member.displayName : user.principal.member.displayName}}</span>
              <v-avatar>
                <v-img :src="getAvatar"></v-img>
              </v-avatar>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="logout" v-if="user.isImpersonating">
              <v-list-item-title>End Impersonation</v-list-item-title>
            </v-list-item>
            <v-list-item data-cy="Logout" @click="logout" v-if="!user.isImpersonating">
              <v-list-item-title>Log Out</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="showTroubleshoot" @click="troubleshootingDialog = true">
              <v-list-item-title>Troubleshooting</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-toolbar-items>
    </v-app-bar>
    <v-content>
      <div>
        <router-view />
      </div>
    </v-content>
    <v-dialog
      v-model="showGateDialog"
      max-width="290"
      persistent
    >
      <v-card>
        <v-card-title class="headline">We need more information!</v-card-title>
        <v-card-text>
          Hey There! There is some more infomation we need to collect from you before you can continue to use your backoffice.
          Please go to your profile page to provide us with your info!
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="$router.push('/profile')">Go To Profile Page</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="troubleshootingDialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="dismissDiagnostics">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Troubleshooting</v-toolbar-title>
        </v-toolbar>
        <v-card-text class="pt-3">
          <template v-if="!troubleShootingCode">
            <h3>Having issues with the Influencer Hub?</h3>
            <p>Please let us know what issues you are seeing and submit site daignostics so we can help you with your current issue.</p>
            <v-textarea outlined counter="250" v-model="troubleShootingMessage"></v-textarea>
            <v-btn color="primary" dark @click="submitTroubleshooting">Submit Diagnostics</v-btn>
          </template>
          <template v-else-if="troubleShootingCode">
            <v-alert type="success">Diagnostics have been submitted succesfully! Please send the following code to support <code class="overline">{{troubleShootingCode}}</code></v-alert>
          </template>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import moment from 'moment'
import { v4 as uuidv4 } from 'uuid'
import { Actions, Mutations } from '@/store'
import { UserMutations, prepPrincipal } from '@/stores/UserStore'
import { CompActions } from '@/stores/CompStore'
import { Actions as MemberActions } from '@/Members/Store'
import { mapState, mapActions, mapMutations, mapGetters } from 'vuex'
import { PRINCIPAL } from '@/graphql/iam.gql'
import { DIAGNOSTICS } from '@/graphql/System.gql'
import { get, isEmpty } from 'lodash'
const impersonationPrefix = 'Impersonating '
export default {
  data () {
    return {
      moment,
      GET: get,
      impersonationPrefix,
      drawer: null,
      activeIntegrations: [],
      payoutIntegrations: [],
      troubleshootingDialog: false,
      troubleShootingCode: null,
      troubleShootingMessage: null
    }
  },
  props: {
    source: String
  },
  computed: {
    ...mapState({
      user: state => state.user,
      showGate: state => state.showGate,
      integrations: state => state.integrations
    }),
    ...mapGetters(['slug']),
    usersStoreUrl () {
      return this.slug ? this.$tenantInfo.storeUrl.replace('{slug}', this.slug) : this.$tenantInfo.corporateUrl
    },
    hasAdminMenu () {
      return this.hasAdmin || this.hasZendeskAdmin
    },
    isNewInfluencer() {
      return moment(this.user.principal.member.joinedOn).isAfter(moment().subtract(30, 'days'))
    },
    hasAdmin () {
      const perms = get(this, 'user.principal.permissions', []) || []
      return perms.findIndex(e => e === 10 || e === '10') >= 0
    },
    hasZendeskAdmin () {
      const tags = get(this, 'user.principal.member.tags', [])
      return tags.indexOf('zendesk:agent') >= 0
    },
    showGateDialog () {
      return this.showGate && this.$route.path.indexOf('profile') === -1
    },
    showTroubleshoot() {
      return true
    },
    getAvatar () {
      let image = this.$tenantInfo.placeholder
      if (!isEmpty(this.user.principal.member.profileUrl) && this.user.principal.member.profileUrl.indexOf('cloudinary') >= 0) {
        image = this.user.principal.member.profileUrl.replace(
          '/image/upload',
          '/image/upload/w_190,h_190'
        )
      } else if (!isEmpty(this.user.principal.member.profileUrl)) {
        return this.user.principal.member.profileUrl
      }
      return image
    }
  },
  methods: {
    logout () {
      this.logoutUser()
      window.location.reload(true)
    },
    dismissDiagnostics () {
      this.troubleshootingDialog = false
      this.troubleShootingCode = null
      this.troubleShootingMessage = null
    },
    async submitTroubleshooting() {
      const uuid = uuidv4()
      const local = JSON.parse(localStorage.getItem('store'))
      const url = window.location.href
      const version = window.$version
      const { userAgent } = window.navigator
      await this.$apollo.mutate({
        mutation: DIAGNOSTICS,
        client: 'federated',
        variables: {
          input: {
            data: { message: this.troubleShootingMessage, local, url, version, userAgent },
            meta: { code: uuid }
          }
        }
      })
      this.troubleShootingCode = uuid
    },
    ...mapMutations([
      Mutations.SET_GATE,
      UserMutations.SET_MEMBER,
      UserMutations.SET_TENANT
    ]),
    ...mapActions({
      logoutUser: Actions.LOGOUT,
      getAttributes: MemberActions.GET_ATTRIBUTES,
      compGetPeriods: CompActions.GET_PERIODS
    }),
    checkJWT() {
      try {
        const dehydratedState = localStorage.getItem('store')
        const hydratedState = JSON.parse(dehydratedState)
        if (!hydratedState.jwtFed) {
          this.logout()
          return
        }

        const jwt = hydratedState.jwtFed
        const decoded = jwt.split('.')[1]
        const payload = JSON.parse(atob(decoded))
        const exp = payload.exp
        const now = Math.floor(Date.now() / 1000)
        if (exp < now) {
          console.warn('Expired JWT... logging out')
          this.logout()
        }
      } catch (e) {
        console.warn(e)
      }
    }
  },
  async mounted () {
    this.checkJWT()
    try {
      await this.compGetPeriods({
        input: {
          memberId: this.user.principal.memberId,
          dateTo: moment().format('YYYY-MM-DD'),
          tenantId: this.$tenantId
        }
      })
    } catch (error) {
      console.error(error)
    }
    if (this.$tenantInfo.features.legal === true) {
      try {
        const res = await this.getAttributes({
          idIn: [this.user.principal.memberId],
          tenantIn: [this.$tenantId]
        })
        const getMemberAttributes = get(res, 'data.membership.search.results.0.attributes', [])
        if (getMemberAttributes.length < 2) {
          this.setGate(true)
        }
      } catch (error) {
        console.error(error)
      }
    }
  },
  apollo: {
    principal: {
      query: PRINCIPAL,
      fetchPolicy: 'network-only',
      client: 'federated',
      update (data) {
        const principal = get(data, 'iam.principal')
        if (principal && principal.member) {
          const { member, tenant } = prepPrincipal(principal)
          const rawTags = get(principal, 'member.tags')
          const tags = rawTags.map(t => t.name)
          member.tags = tags
          this.setMember(member)
          this.setTenant(tenant)
          const integrations = get(principal, 'tenant.integrations', [])
          const statusId = get(principal, 'member.statusId')
          // Status Id 1 = Active Member
          if (!this.user.isImpersonating && (statusId !== 1 || tags.indexOf('backoffice:locked') >= 0)) {
            console.warn('StatusId was either invalid or a tag of "backoffice:locked" was detected! Logging user out', { statusId, tags })
            this.logoutUser()
            window.location.reload(true)
          }
          this.activeIntegrations = integrations.filter(i => {
            return this.integrations.indexOf(i.key) > -1 && i.statusId === 200
          })
        } else {
          console.warn('No principal data received! Logging user out', { data })
          this.logoutUser()
          window.location.reload(true)
        }
      },
      error (error) {
        console.error(error)
        this.logoutUser()
        window.location.reload(true)
      }
    }
  }
}
</script>

<style scoped>
.avatar {
  max-width: 50px;
  max-height: 50px;
  border-radius: 100px;
  margin-left: 12px;
}
@media only screen and (max-width: 959px) {
  .avatar {
    width: 40px;
    margin-left: 0;
  }
}
.main {
  background-color: #e5e5e5;
  min-height: 100vh;
}
.logo {
  width: 100%;
  max-width: 100px;
  margin: 15px auto;
  display: block;
}
.footer-wrapper {
  flex-grow: 2;
  position: relative;
  min-height: 112px;
}
.footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  color: rgba(0, 0, 0, 0.54);
}
.footer img {
  width: 25px;
  height: 25px;
}
.title {
  text-transform: capitalize;
}
</style>
