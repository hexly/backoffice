<template>
  <div class="xomly-integration">
    <h2>
      Xomly Integration
    </h2>
    <h3> Xomly provides {{tenant.name}} with a premier sales enablement product. </h3>
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
        </v-form>
        <v-btn type="submit" color="primary">
          Create Account
        </v-btn>
      </div>
    <div v-if="integrationDetails">
      <p>You are properly set up! Click the button below to launch xomly.</p>
      <v-btn :to="`https://www.xomly.com/pages/getting-started`" color="primary">
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
    details: Object
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
    this.integrations.forEach(i => {
      if (i.key === 'xomly') {
        this.integrationDetails = i
      }
    })
    this.loading = false
  },
  methods: {
    beginSetup() {
      this.setup = true
    },
    setupXomly() {
      console.log(this.password, this.details, this.member)
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
