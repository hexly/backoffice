<template>
  <v-app
    id="backoffice"
    :class="'tenant-' + tenant"
  >
    <v-snackbar
      :timeout="0"
      bottom
      right
      v-model="newVersionAvailable"
    >
      New Version Available!
      <v-btn
        flat
        @click="update"
        color="primary"
      >Click to update</v-btn>
    </v-snackbar>
    <router-view />
  </v-app>
</template>

<script>
const MIN_IN_SECONDS = 60
const SECONDS_IN_MS = 1000

const INTERVAL_VAL = 30 * MIN_IN_SECONDS * SECONDS_IN_MS // 30 MIN
export default {
  data () {
    return {
      tenant: process.env.VUE_APP_TENANT_ID,
      newVersionAvailable: false
    }
  },
  mounted () {
    this.checkAppVersion()
  },
  methods: {
    async checkAppVersion () {
      const response = await fetch('/manifest.json')
      const json = await response.json()

      this.newVersion = json.buildTime
      const currentVersion = window.$version
      const current = this.$moment(currentVersion)
      const newVersion = this.$moment(json.buildTime)
      if (current.isValid() && current.isBefore(newVersion)) {
        this.newVersionAvailable = true
        clearInterval(this.appVersionInterval)
      } else {
        console.warn(`version up to date setting timeout to ${INTERVAL_VAL / SECONDS_IN_MS / MIN_IN_SECONDS} minutes to check for new version`)

        this.appVersionInterval = setTimeout(this.checkAppVersion, INTERVAL_VAL) // Check for the app version every 30 minutes
      }
    },
    update () {
      location.reload(true)
    }
  }
}
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#backoffice {
  background-image: linear-gradient(to right top, #33ccbb, #3b2f93);
}

#backoffice.tenant-1004 {
  background-image: none;
  background-color: #373331;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

@media only screen and (max-width: 959px){
  .container{
    padding: 2px !important;
  }
}
</style>
