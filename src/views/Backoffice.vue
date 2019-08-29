<template>
  <div>
    <v-navigation-drawer fixed v-model="drawer" app temporary clipped>
      <div class="text-xs-center">
        <img :src="$tenantInfo.logoPath" class="logo">
      </div>
      <v-divider></v-divider>
      <v-list dense>
        <v-list-tile to="/dashboard">
          <v-list-tile-action>
            <v-icon>home</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Dashboard</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile to="/profile">
          <v-list-tile-action>
            <v-icon>contact_mail</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Profile</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <!-- <v-list-tile to="/assets">
          <v-list-tile-action>
            <v-icon>perm_media</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Assets</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>-->
        <v-list-tile to="/sales">
          <v-list-tile-action>
            <v-icon>shopping_basket</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Order History</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile to="/team">
          <v-list-tile-action>
            <v-icon>people</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Team</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile v-if="activeIntegrations.length" to="/integrations">
          <v-list-tile-action>
            <v-icon>compare_arrows</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Integrations</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>

      <v-divider></v-divider>
      <v-list>
        <v-list-tile :href="usersStoreUrl" target="_blank">
          <v-list-tile-action>
            <v-icon>store</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Shop</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
      <div column class="text-xs-center py-4 footer">
        <div>
          <a v-for="social in $tenantInfo.social" :key="social.key" :href="social.url" target="_blank">
            <img :src="`/img/social/${social.key}.svg`" />
          </a>
        </div>
        <h5 class="py-4">Copyright 2019</h5>
      </div>
    </v-navigation-drawer>
    <v-toolbar :color="$tenantInfo.baseColor" dark fixed app>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title class="title">{{$route.name}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-menu offset-y>
          <v-btn flat slot="activator">
            <span data-cy="Display Name" v-if="$vuetify.breakpoint.mdAndUp">
              {{user.isImpersonating ? impersonationPrefix + user.principal.member.displayName : user.principal.member.displayName}}
            </span>
            <img class="avatar" :src="getAvatar" />
          </v-btn>
          <v-list>
            <v-list-tile @click="logout" v-if="user.isImpersonating">
              <v-list-tile-title >End Impersonation</v-list-tile-title>
            </v-list-tile>
            <v-list-tile data-cy="Logout" @click="logout" v-if="!user.isImpersonating">
              <v-list-tile-title>Log Out</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>
      </v-toolbar-items>
      <v-progress-linear class="loading-bar" style="margin: 0;" v-if="loading" :indeterminate="true" color="secondary"></v-progress-linear>
    </v-toolbar>
    <v-content>
      <div class="main">
        <router-view/>
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
            flat="flat"
            @click="$router.push('/profile')"
          >
            Go To Profile Page
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Actions, Mutations } from '@/store'
import { UserMutations } from '@/stores/UserStore'
import { Actions as MemberActions } from '@/Members/Store'
import { mapState, mapActions, mapMutations } from 'vuex'
import GET_PRINCIPAL from '@/graphql/Principal.gql'
import { get } from 'lodash'

const impersonationPrefix = 'Impersonating '

export default {
  data() {
    return {
      impersonationPrefix,
      drawer: null,
      activeIntegrations: []
    }
  },
  props: {
    source: String
  },
  computed: {
    ...mapState({
      user: state => state.user,
      showGate: state => state.showGate,
      loading: state => state.loading,
      integrations: state => state.integrations
    }),
    usersStoreUrl() {
      return this.$tenantInfo.storeUrl.replace('{slug}', this.user.principal.member.slug)
    },
    showGateDialog() {
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
    logout() {
      this.$store.dispatch(Actions.LOGOUT)
      this.$router.go('/login')
    },
    ...mapMutations([Mutations.SET_GATE, UserMutations.SET_PRINCIPAL, Mutations.SET_LOADING]),
    ...mapActions({
      getAttributes: MemberActions.GET_ATTRIBUTES
    })
  },
  async mounted () {
    this.setLoading(true)
    const { data } = await this.getAttributes({
      key: ['affiliate-agreement', 'entity-details'],
      accessMode: 'ALL',
      memberId: this.user.principal.memberId
    })
    if (data.getMemberAttributes.length < 2) {
      this.setGate(true)
    }
    this.setLoading(false)
  },
  apollo: {
    principal: {
      query: GET_PRINCIPAL,
      update({ getPrincipal }) {
        if (getPrincipal) {
          this.setPrincipal(getPrincipal)
          const address = get(getPrincipal, 'member.contacts[0].addresses[0]')
          if (!address) {
            this.setGate(true)
          }
          const integrations = get(getPrincipal, 'tenant.integrations')
          this.activeIntegrations = integrations.filter(i => {
            return this.integrations.indexOf(i.key) > -1 && i.statusId === 200
          })
        }
      }
    }
  }
}
</script>

<style scoped>
.loading-bar{
  height: 7px;
  margin: 0px;
  position: absolute;
  bottom: -7px;
  left: 0;
}
.avatar{
  max-width: 50px;
  max-height: 50px;
  border-radius: 100px;
  margin-left: 12px;
}

@media only screen and (max-width: 959px){
  .avatar{
    width: 40px;
    margin-left: 0;
  }
}

.main {
  margin: auto;
  background-color: #e5e5e5;
  box-shadow: 1px 2px 6px -2px #000;
  min-height: 100vh;
}

.logo {
  width: 100%;
  max-width: 100px;
  margin: 15px auto;
  display: block;
}

.footer{
  position: absolute;
  bottom: 0;
  width: 100%;
  color: rgba(0,0,0,.54);
}

.footer img{
  width: 25px;
  height: 25px;
}

.title {
 text-transform: capitalize;
}
</style>
