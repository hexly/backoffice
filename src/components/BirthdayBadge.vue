<template>
  <v-chip pill color="primary" text-color="white">
    <v-avatar left class="primary darken-4">
      <v-icon>cake</v-icon>
    </v-avatar>
    {{birthday}}
  </v-chip>
</template>

<script>
export default {
  name: 'BirthdayBadge',
  props: {
    joinedOn: String // Just leave it... I know
  },
  computed: {
    birthday() {
      const time = this.$moment(this.joinedOn).toNow(true)
      if (time === 'a year') {
        return '1 year'
      }
      return time
    }
  }
}
</script>
