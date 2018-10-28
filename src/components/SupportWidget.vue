<template>
  <div class="floaty-button">
    <div class="text-xs-center">
      <v-btn fab large
        color="primary"
        @click="alert = !alert"
      >
        <v-icon large color="white darken-2">chat</v-icon>
      </v-btn>
    </div>
    <v-alert
      style="background-color: white; width: 350px;"
      :value="alert"
      color="white"
      transition="scale-transition"
    >
      <div v-if="error" class="error">{{error}}</div>
      <div v-if="success" class="success">{{success}}</div>
      <v-form v-if="!success" ref="supportForm">
        <p style="color: black;"><strong>Questions? Chat with us!</strong></p>
        <v-text-field required :rules="requiredRule" id="name" label="Name" v-model="name"></v-text-field>
        <v-text-field required :rules="emailRule" id="email" label="Email Address" v-model="email"></v-text-field>
        <v-text-field required :rules="requiredRule" id="subject" label="Subject" v-model="subject"></v-text-field>
        <v-textarea required :rules="requiredRule" auto-grow id="question" label="Support Question" v-model="message"></v-textarea>
        <v-btn :loading="loading" @click="submit" style="background-color: blue; color: white;"> Submit </v-btn>
      </v-form>
    </v-alert>
  </div>
</template>

<script>
import AddSupportTicket from '@/graphql/AddSupportTicket.gql'
const { VUE_APP_TENANT_ID } = process.env

export default {
  name: 'SupportWidget',
  data() {
    return {
      alert: false,
      name: '',
      email: '',
      subject: '',
      message: '',
      success: false,
      error: false,
      loading: false,
      requiredRule: [v => !!v || 'This field is required'],
      emailRule: [
        v => !!v || 'E-mail is required',
        v =>
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
          'E-mail must be valid'
      ]
    }
  },
  mounted() {
    if (
      this.$store.state.user.principal &&
      this.$store.state.user.principal.member.name
    ) {
      this.name = this.$store.state.user.principal.member.name
    }
    if (
      this.$store.state.user.principal &&
      this.$store.state.user.principal.username
    ) {
      this.email = this.$store.state.user.principal.username
    }
  },
  methods: {
    async submit() {
      this.error = false
      if (this.$refs.supportForm.validate()) {
        this.loading = true
        try {
          const { data } = await this.$apollo.mutate({
            mutation: AddSupportTicket,
            variables: {
              tc: {
                name: this.name,
                email: this.email,
                message: this.message,
                subject: this.subject,
                tenantId: VUE_APP_TENANT_ID
              }
            }
          })
          this.success = `Your support ticket has been created. Your ticket number is ${
            data.ticketCreate.short
          }. For future reference please use this number.`
          this.loading = false
        } catch (err) {
          console.log('got an error', err)
          this.loading = false
          this.error = err
        }
      }
    }
  }
}
</script>
<style>
.floaty-button {
  position: fixed;
  bottom: 40px;
  right: 25px;
}

.error {
  margin: 5px;
  padding: 10px;
  text-align: center;
}

.success {
  margin: 5px;
  padding: 10px;
  text-align: center;
}

.sup-form {
  height: 40%;
}
</style>
