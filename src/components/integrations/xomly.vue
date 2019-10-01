<template>
  <div class="xomly-integration">
    <h2>
      Xomly Integration
    </h2>
    <h3> Xomly provides {{tenant.name}} with a premier sales enablement product. </h3>
    <v-alert type="error" :value="error">
      {{error}}
    </v-alert>
    <div v-if="!integrationDetails && !loading && !setup">
      <p> It looks like you do not yet have a Xomly account.
        <br/>
        Please click the button below to begin your account setup! </p>
      <v-btn @click="beginSetup" color="primary">
        Setup Account
      </v-btn>
    </div>
    <div v-if="!loading && setup">
        <h3>Account Setup</h3>
        <p>Please confirm your password in order to set up Xomly</p>
        <v-form @submit.prevent="setupXomly" width="500">
          <v-text-field
            label="password"
            v-model="password"
            type="password"
            :rules="rules.required"
          />
          <v-btn type="submit" color="primary">
            Create Account
          </v-btn>
        </v-form>
      </div>
    <div v-if="integrationDetails">
      <p>You are properly set up! Click the button below to launch xomly.</p>
      <v-btn target="_blank" href="https://www.xomly.com/pages/getting-started" color="primary">
        Launch Xomly
      </v-btn>
    </div>
  </div>
</template>

<script>
import Rules from '@/views/Rules.js'
import { mapState } from 'vuex'

export default {
  name: 'XomlyIntegration',
  props: {
    details: Object,
    error: String
  },
  data() {
    return {
      loading: false,
      integrationDetails: null,
      setup: false,
      password: null,
      rules: Rules
    }
  },
  mounted() {
    this.loading = true
    this.reload()
    this.loading = false
  },
  methods: {
    beginSetup() {
      this.setup = true
    },
    setupXomly() {
      this.$emit('create', {
        command: 'xomly',
        tenantIntegrationId: this.details.id,
        data: {
          password: this.password,
          email: this.member.contacts[0].emails[0].email,
          firstName: this.member.firstName,
          lastName: this.member.lastName
        }
      })
    },
    reload() {
      this.integrations.forEach(i => {
        if (i.key === 'xomly') {
          this.setup = false
          this.integrationDetails = i
        }
      })
    }
  },
  computed: {
    ...mapState({
      member: state => state.user.principal.member,
      integrations: state => state.user.principal.member.tenantIntegrations,
      tenant: state => state.user.principal.tenant
    })
  }
}
</script>

<style>
.xomly-integration{
  width: 100%;
  max-width: 500px;
  margin: auto;
}
</style>
