<template>
  <img :src="hash" />
</template>
<script>
import md5 from 'md5'

export default {
  name: 'Gravatar',
  props: {
    email: String
  },
  computed: {
    hash() {
      return `https://www.gravatar.com/avatar/${md5(this.email)}`
    }
  }
}
</script>
