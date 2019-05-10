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
    <v-toolbar :color="$tenantInfo.secondaryColor" dark fixed app>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>Backoffice</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-menu offset-y>
          <v-btn flat slot="activator">
            {{user.isImpersonating ? impersonationPrefix + user.principal.member.displayName : user.principal.member.displayName}}
            <img class="avatar" :src="getAvatar" />
          </v-btn>
          <v-list style="cursor: pointer;">
            <!-- <v-list-tile>
              <v-list-tile-title>Settings</v-list-tile-title>
            </v-list-tile>-->
            <v-list-tile @click="logout" v-if="user.isImpersonating">
              <v-list-tile-title >End Impersonation</v-list-tile-title>
            </v-list-tile>
            <v-list-tile @click="logout" v-if="!user.isImpersonating">
              <v-list-tile-title>Log Out</v-list-tile-title>
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
            color="green darken-1"
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
import { Actions as MemberActions } from '@/Members/Store'
import { mapState, mapActions, mapMutations } from 'vuex'

const impersonationPrefix = 'Impersonating '

export default {
  data: () => ({
    impersonationPrefix,
    drawer: null
  }),
  props: {
    source: String
  },
  computed: {
    ...mapState({
      user: state => state.user,
      showGate: state => state.showGate
    }),
    showGateDialog() {
      return this.showGate && this.$route.path.indexOf('profile') === -1
    },
    getAvatar () {
      let image = this.$tenantInfo.placeholder
      if (this.user.principal.profileUrl) {
        image = this.user.principal.profileUrl.replace(
          '/image/upload',
          '/image/upload/w_190,h_190'
        )
      }
      return image
    }
  },
  methods: {
    ...mapMutations([Mutations.SET_GATE]),
    ...mapActions({
      getAttributes: MemberActions.GET_ATTRIBUTES
    }),
    async logout() {
      await this.$store.dispatch(Actions.LOGOUT)
      this.$router.go('/login')
    }
  },
  async mounted () {
    const { data } = await this.getAttributes({
      key: ['affiliate-agreement', 'entity-details'],
      accessMode: 'ALL',
      memberId: this.user.principal.memberId
    })
    if (data.getMemberAttributes.length < 2) {
      this.setGate(true)
    }
  }
}
</script>

<style scoped>
.avatar{
  width: 50px;
  border-radius: 100px;
  margin-left: 12px;
}

.main {
  margin: auto;
  background-color: #fafafa;
  box-shadow: 1px 2px 6px -2px #000;
  min-height: 100vh;
}

.logo {
  width: 100%;
  max-width: 100px;
  margin: 50px auto;
  display: block;
}
</style>
