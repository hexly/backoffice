<template>
  <div>
    <v-alert :value="alert" type="info">
      Oops, there was a problem loading facebook.
      <br/>
      Please try another browser or try allowing third party cookies
    </v-alert>
    <div v-if="!alert">
      <v-btn
        class="facebook_sync white--text"
        color="#4267b2"
        @click="checkLoginState"
        :loading="loading"
        :disabled="loading"
      > Link A Facebook Account
      </v-btn>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import FacebookPlugin from '@/plugins/Facebook'

export default {
  name: 'FacebookLogin',
  props: {
    appId: String,
    loading: Boolean
  },
  data() {
    return {
      alert: false
    }
  },
  mounted() {
    if (!window.FB) {
      Vue.use(FacebookPlugin,
        { appId: this.appId,
          ready: () => {
            this.$emit('ready', 'facebook')
          } })
    } else {
      this.$emit('ready', 'facebook')
    }
  },
  methods: {
    checkLoginState() {
      if (window.FB) {
        window.FB.getLoginStatus(({ authResponse: auth }) => {
          if (auth) {
            this.getFriends(auth)
          } else {
            window.FB.login(({ authResponse: auth }) => {
              this.getFriends(auth)
            })
          }
        })
      } else {
        this.alert = true
      }
    },
    getFriends(auth) {
      const { userID } = auth
      window.FB.api(`/${userID}/friends`, 'get', {}, this.friendCB(auth))
    },
    friendCB(auth) {
      return (res) => {
        if (res && res.data) {
          const ids = res.data.map(e => e.id)
          this.$emit('sync', { auth, ids, key: 'facebook', profileUrl: this.pic(auth.userId) })
        }
      }
    },
    lookup(details) {
      return new Promise((resolve, reject) => {
        window.FB.api(`/${details.integrationOid}/`, 'get', {}, (res) => {
          resolve({ ...details, displayName: res.name })
        })
      })
    },
    pic(userId) {
      return 'http://graph.facebook.com/' + userId + '/picture?type=normal'
    }
  }
}
</script>

<style scoped>
</style>
