<template>
  <div>
    <h2>
      Paychex Payment Integration
    </h2>
    <h3> Paychecks provides {{tenant.name}} with payout solutions. </h3>
    <div v-if="!integrationDetails && !loading && !setup">
      <p> It looks like you do not yet have a paychex account.
        <br/>
        Please click the button below to begin your account setup! </p>
      <v-btn @click="beginSetup" color="primary">
        Setup Account
      </v-btn>
    </div>
    <div v-if="!loading && setup">
      setup up
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'PaychexIntegration',
  data() {
    return {
      loading: false,
      integrationDetails: null,
      setup: false
    }
  },
  mounted() {
    this.loading = true
    this.integrations.forEach(i => {
      if (i.key === 'paychex') {
        this.integrationDetails = i
      }
    })
    this.loading = false
  },
  methods: {
    beginSetup() {
      this.setup = true
    }
  },
  computed: {
    ...mapState({
      integrations: state => state.user.principal.member.integrations,
      tenant: state => state.user.principal.tenant
    })
  }
}
</script>
