<template>
  <div class="main">
    <v-navigation-drawer
      fixed
      v-model="drawer"
      app
    >
      <div
        v-if="$tenantInfo.logoPath"
        class="text-center"
      >
        <img
          :src="$tenantInfo.logoPath"
          class="logo"
        />
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
         <v-list-item v-if="$tenantInfo.features.insights" to="/insights">
          <v-list-item-action>
            <v-icon>insights</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Insights</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="$tenantInfo.features.announcements" to="/announcements">
          <v-list-item-action>
            <v-icon>announcement</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Announcements</v-list-item-title>
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
        <!-- <v-list-item to="/assets">
          <v-list-item-action>
            <v-icon>perm_media</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Assets</v-list-item-title>
          </v-list-item-content>
        </v-list-item>-->
        <v-list-item
          v-if="$tenantInfo.features.sales"
          to="/sales"
        >
          <v-list-item-action>
            <v-icon>shopping_basket</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Order History</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          v-if="GET($tenantInfo, 'features.team.base', true)"
          to="/team"
        >
          <v-list-item-action>
            <v-icon>people</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Team</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          v-if="$tenantInfo.features.payouts"
          to="/payouts"
        >
          <v-list-item-action>
            <v-icon>attach_money</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Payouts</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          v-if="activeIntegrations.length"
          to="/integrations"
        >
          <v-list-item-action>
            <v-icon>compare_arrows</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Integrations</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          v-if="$tenantInfo.features.customers"
          to="/customers"
        >
          <v-list-item-action>
            <v-icon>people_outline</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Customers <sup>beta</sup></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          v-if="$tenantInfo.features.files"
          to="/files"
        >
          <v-list-item-action>
            <v-icon>topic</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{$tenantInfo.strings.files || 'Files'}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>
      <v-list>
        <v-list-item
          :href="usersStoreUrl"
          target="_blank"
        >
          <v-list-item-action>
            <v-icon>store</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Shop</v-list-item-title>
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
        <v-list-item
          target="_blank"
          href="https://admin.hexly.cloud"
        >
          <v-list-item-action>
            <v-icon>cloud_circle</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Hexly Admin</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          v-if="hasZendeskAdmin"
          to="/zendesk"
        >
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
    <v-app-bar
      :color="$tenantInfo.baseColor"
      dark
      fixed
      app
    >
      <v-app-bar-nav-icon
        v-if="$vuetify.breakpoint.mdAndDown"
        @click.stop="drawer = !drawer"
      ></v-app-bar-nav-icon>
      <v-toolbar-title class="title">{{$route.name}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-menu offset-y>
          <template v-slot:activator="{ on }">
            <v-btn
              text
              v-on="on"
            >
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
            <v-list-item
              @click="logout"
              v-if="user.isImpersonating"
            >
              <v-list-item-title>End Impersonation</v-list-item-title>
            </v-list-item>
            <v-list-item
              data-cy="Logout"
              @click="logout"
              v-if="!user.isImpersonating"
            >
              <v-list-item-title>Log Out</v-list-item-title>
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
          <v-btn
            color="primary"
            text
            @click="$router.push('/profile')"
          >Go To Profile Page</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import moment from 'moment'
import { Actions, Mutations } from '@/store'
import { UserMutations, UserActions } from '@/stores/UserStore'
import { CompActions } from '@/stores/CompStore'
import { Actions as MemberActions } from '@/Members/Store'
import { GET_MEMBER_DETAILS, GET_MEMBER_TENANT_INTEGRATIONS_FED } from '@/graphql/Member.gql'
import { mapState, mapActions, mapMutations, mapGetters } from 'vuex'
import { get } from 'lodash'

const impersonationPrefix = 'Impersonating '

export default {
  data () {
    return {
      moment,
      GET: get,
      impersonationPrefix,
      drawer: null,
      activeIntegrations: [],
      payoutIntegrations: []
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
    ...mapGetters(['slug', 'memberId']),
    usersStoreUrl () {
      return this.slug ? this.$tenantInfo.storeUrl.replace('{slug}', this.slug) : this.$tenantInfo.corporateUrl
    },
    hasAdminMenu () {
      return this.hasAdmin || this.hasZendeskAdmin
    },
    hasAdmin () {
      const perms = get(this, 'user.principal.permissions', [])
      return perms.findIndex(e => e === 10 || e === '10') >= 0
    },
    hasZendeskAdmin () {
      const tags = get(this, 'user.principal.member.tags', [])
      return tags.indexOf('zendesk:agent') >= 0
    },
    showGateDialog () {
      return this.showGate && this.$route.path.indexOf('profile') === -1
    },
    getAvatar () {
      let image = this.$tenantInfo.placeholder
      if (this.user.principal.member.profileUrl && this.user.principal.member.profileUrl.indexOf('cloudinary')) {
        image = this.user.principal.member.profileUrl.replace(
          '/image/upload',
          '/image/upload/w_190,h_190'
        )
      } else if (this.user.principal.member.profileUrl) {
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
    ...mapMutations([Mutations.SET_GATE, UserMutations.SET_PRINCIPAL]),
    ...mapActions({
      logoutUser: Actions.LOGOUT,
      getAttributes: MemberActions.GET_ATTRIBUTES,
      compGetPeriods: CompActions.GET_PERIODS,
      getMemberDetails: UserActions.GET_MEMBER_DETAILS
    })
  },
  async mounted () {
    const { memberId, $tenantId: tenantId } = this
    await this.compGetPeriods({ memberId, tenantId })
    if (this.$tenantInfo.features.legal === true) {
      const { data } = await this.getAttributes({
        key: ['affiliate-agreement', 'entity-details'],
        accessMode: 'ALL',
        memberId: this.user.principal.memberId
      })
      if (data.getMemberAttributes.length < 2) {
        this.setGate(true)
      }
    }
  },
  apollo: {
    memberDetails: {
      query: GET_MEMBER_DETAILS,
      variables() {
        return {
          input: {
            tenantIn: [this.$tenantId],
            idIn: [this.memberId]
          }
        }
      },
      skip() {
        return !this.memberId
      },
      async update(data) {
        const { memberId, $tenantId: tenantId } = this
        let tenantIntegrationRes
        try {
          tenantIntegrationRes = await this.$apollo.query({
            query: GET_MEMBER_TENANT_INTEGRATIONS_FED,
            variables: {
              input: {
                memberId
              }
            },
            client: 'federated'
          })
        } catch (error) {
          console.warn(error, { memberId, tenantId })
        }
        const principal = get(this, 'user.principal')
        const tags = get(data, 'membership.search.results[0].tags')
        const parsedTags = tags.map(tag => tag.name)
        const statusId = get(data, 'membership.search.results[0].statusId')
        const slug = get(data, 'membership.search.results[0].slug')
        const integrations = get(data, 'membership.search.results[0].integrations')
        const customer = get(data, 'membership.search.results[0].customer', [])
        const profileUrl = get(data, 'membership.search.results[0].avatar.assetUrl', [])
        const contacts = get(data, 'membership.search.results[0].contacts', [])
        const tenantIntegrations = get(tenantIntegrationRes, 'membership.getMemberTenantIntegrations', [])
        if (!this.user.isImpersonating && (statusId !== 1 || tags.indexOf('backoffice:locked') >= 0)) {
          this.logoutUser()
          window.location.reload(true)
        }

        const memberDetails = { tags: parsedTags, customer, profileUrl, tenantIntegrations, contacts, statusId, slug, integrations }
        principal.member = { ...principal.member, ...memberDetails, customer }
        principal.tenant = {
          ...principal.tenant,
          integrations: tenantIntegrations,
          id: tenantId
        }
        this.setPrincipal(principal)

        return null
      },
      client: 'federated'
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
