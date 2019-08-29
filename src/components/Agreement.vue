<template>
   <v-checkbox
      v-model="agreement.accepted"
      :rules="requiredRule"
      :readonly="!read"
      :persistent-hint="!read"
      :hint="`Note: You must read the ${agreement.name} before agreeing`"
    >
      <div slot="label">
        I agree to the
        <a
          @click="agreementRead"
          target="_blank"
          :href="agreement.url"
        >{{agreement.name}}</a>
      </div>
    </v-checkbox>
</template>

<script>
export default {
  name: 'Agreement',
  props: {
    agreement: Object
  },
  data() {
    return {
      accepted: false,
      read: false,
      requiredRule: [v => !!v || 'Field is required']
    }
  },
  methods: {
    agreementRead() {
      this.read = true
    }
  },
  watch: {
    accepted(newVal) {
      this.$emit('agreementAccepted', newVal, this.agreement.key)
    }
  }
}
</script>

<style scoped>

</style>
