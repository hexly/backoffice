<template>
  <v-app id="backoffice" :class="'tenant-' + tenant">
    <router-view/>
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      tenant: process.env.VUE_APP_TENANT_ID
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#backoffice {
  background-image: linear-gradient(to right top, #33ccbb, #3b2f93);
}

#backoffice.tenant-1004 {
  background-image: linear-gradient(to right, #722c7c, #6fb457);
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
</style>
