<template>
  <div>
    <v-navigation-drawer fixed v-model="drawer" app temporary clipped>
      <div class="text-xs-center">
        <img :src="logoPath" class="logo">
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
            <v-list-tile-title>Sales</v-list-tile-title>
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
        <v-list-tile :to="'/impersonate/' + jwt">
          <v-list-tile-action>
            <v-icon>people_outline</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Impersonate</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar color="black" dark fixed app>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>Backoffice</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-menu offset-y>
          <v-btn flat slot="activator">{{user.isImpersonating ? impersonationPrefix + user.principal.member.displayName : user.principal.member.displayName}}</v-btn>
          <v-list style="cursor: pointer;">
            <!-- <v-list-tile>
              <v-list-tile-title>Settings</v-list-tile-title>
            </v-list-tile>-->
            <v-list-tile v-if="user.isImpersonating">
              <v-list-tile-title @click="impersonationReturn">Return to {{user.previousPrincipal.member.displayName}}</v-list-tile-title>
            </v-list-tile>
            <v-list-tile>
              <v-list-tile-title @click="logout">Log Out</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>
      </v-toolbar-items>
    </v-toolbar>
    <v-content>
      <v-container fluid class="main">
        <router-view/>
      </v-container>
    </v-content>
  </div>
</template>

<script>
import tenantInfo from '@/tenant.js'
import { Actions } from '@/store'
import { UserMutations } from '@/stores/UserStore'
import { mapState, mapMutations } from 'vuex'

const impersonationPrefix = 'Impersonation of '

export default {
  data: () => ({
    impersonationPrefix,
    drawer: null,
    logoPath: tenantInfo.logoPath,
    jwt: null
  }),
  props: {
    source: String
  },
  computed: {
    ...mapState({
      user: state => state.user
    })
  },
  methods: {
    async logout() {
      await this.$store.dispatch(Actions.LOGOUT)
      this.$router.go('/login')
    },
    ...mapMutations([UserMutations.IMPERSONATION_RETURN])
  },
  mounted () {
    this.jwt = this.$store.state.user.jwt
  }
}
</script>

<style scoped>
.main {
  padding: 25px;
  margin: 50px auto;
  background-color: #fafafa;
  box-shadow: 1px 2px 6px -2px #000;
  min-height: calc(100vh - 164px);
}
.logo {
  width: 100%;
  max-width: 250px;
  margin: auto;
  display: block;
}
</style>
