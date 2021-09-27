<template>
  <v-content>
    <v-form
      ref="login"
      @submit.prevent="onSubmit()"
    >
      <v-text-field
        required
        v-model="form.token"
        prepend-icon="business"
        name="token"
        label="One Time Token"
      ></v-text-field>
      <v-text-field
        required
        v-model="form.pin"
        prepend-icon="person"
        name="pin"
        label="PIN"
      ></v-text-field>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          :loading="locked"
          type="submit"
          color="primary"
          dark
        > Impersonate </v-btn>
      </v-card-actions>
    </v-form>
  </v-content>
</template>

<script>

import { UserActions } from '@/stores/UserStore'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'ImpersonatePrompt',
  data () {
    return {
      ...mapState({
        user: state => state.user
      }),
      locked: false,
      form: {
        token: this.$route.params.token || '',
        pin: ''
      }
    }
  },
  methods: {
    ...mapActions({ login: UserActions.LOGIN }),
    async onSubmit () {
      this.locked = true
      const { token, pin: temporaryPin } = this.form
      try {
        const { $tenantId: tenantId } = this
        const email = 'impersonating@example.com'
        const password = 'nopassword'
        const impersonation = {
          token, code: temporaryPin
        }
        await this.login({ email, password, tenantId, impersonation })
        this.$router.push('/dashboard')
      } catch (err) {
        console.warn(err)
        alert('Something went wrong')
      } finally {
        this.locked = false
      }
    }
  }
}

</script>

<style scoped>
.box-card {
  width: 480px;
  margin: auto;
}
.error {
  margin: 5px;
  padding: 10px;
  text-align: center;
}
.logo {
  width: 100%;
  max-width: 250px;
  margin: auto;
  display: block;
}
</style>
