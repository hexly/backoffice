<template>
  <a @click="checkLoginState">Sync Account With Facebook</a>
</template>

<script>
export default {
  name: 'FacebookLogin',
  methods: {
    checkLoginState() {
      window.FB.getLoginStatus(({ authResponse: auth }) => {
        if (auth) {
          const { userID } = auth
          window.FB.api(`/${userID}/friends`, 'get', {}, window.friendCB(auth))
        }
      })
    },
    friendCB(auth) {
      return (res) => {
        console.log('friends', { res })
        if (res && res.data) {
          const ids = res.data.map(e => e.id)
          console.log({ auth, ids })
        }
      }
    }
  }
}
</script>
