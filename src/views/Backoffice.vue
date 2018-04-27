<template>
  <div>
    <v-navigation-drawer
      fixed
      v-model="drawer"
      app
      temporary
      clipped
    >
      <div class="text-xs-center">
        <img :src="logoPath" class="logo" />
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
      </v-list>
    </v-navigation-drawer>
    <v-toolbar color="black" dark fixed app>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>Backoffice</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-menu offset-y>
          <v-btn flat slot="activator">{{displayName}}</v-btn>
          <v-list>
            <v-list-tile>
              <v-list-tile-title>Settings</v-list-tile-title>
            </v-list-tile>
            <v-list-tile>
              <v-list-tile-title @click="logout">Log Out</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>
      </v-toolbar-items>
    </v-toolbar>
    <v-content>
      <v-container class="main">
        <router-view />
      </v-container>
    </v-content>
  </div>
</template>

<script>
import tenantInfo from '@/tenant.js'
import { Actions } from '@/store'

export default {
  data: () => ({
    drawer: null,
    logoPath: tenantInfo.logoPath
  }),
  props: {
    source: String
  },
  computed: {
    displayName() {
      return this.$store.getters.displayName
    }
  },
  methods: {
    async logout() {
      await this.$store.dispatch(Actions.LOGOUT)
      this.$router.go('/login')
    }
  }
}
</script>

<style scoped>
.main {
  padding: 25px;
  margin: 50px auto;
  background-color: #fafafa;
  border-radius: 10px;
  box-shadow: 1px 2px 6px -2px #000;
}
.logo {
  width: 100%;
  max-width: 250px;
  margin: auto;
  display: block;
}
</style>
