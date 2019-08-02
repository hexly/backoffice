<template>

</template>

<script>
export default {
  name: 'TeamCard',
  data() {
    return {
      show: false
    }
  },
  props: {
    user: Object,
    actions: Boolean,
    stats: Object,
    loading: Boolean,
    noData: String
  },
  methods: {
    formatDate (value) {
      return this.$moment(value, 'YYYY-MM-DD').from(this.$moment())
    },
    viewTeam () {
      this.$emit('viewTeam', this.user)
    }
  },
  computed: {
    getAvatar () {
      return (
        (this.user && this.user.profileUrl) ||
        this.$tenantInfo.placeholder
      )
    },
    isQualified () {
      if (this.stats) {
        let joined = new Date(this.stats.joinedOn)
        let today = new Date()
        joined = `${joined.getFullYear()}-${joined.getMonth()}`
        today = `${today.getFullYear()}-${today.getMonth()}`
        const joinedThisMonth = joined === today
        return this.stats.totalPoints >= 60 || joinedThisMonth
      }
      return false
    },
    hasEmail () {
      return this.user.contacts[0].emails[0].email
    }
  }
}
</script>

<style scoped>
</style>
