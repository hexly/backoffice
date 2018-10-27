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
      style="background-color: white;"
      :value="alert"
      color="white"
      transition="scale-transition"
    >
      <div v-if="error">{{error}}</div>
      <div v-if="success">{{success}}</div>
      <v-form v-if="!success" lazy-validation="">
        <p style="color: black;"><strong>Questions? Chat with us!</strong></p>
        <v-text-field :rules="requiredRule" label="Name" v-model="name"></v-text-field>
        <v-text-field :rules="requiredRule" label="Subject" v-model="subject"></v-text-field>
        <v-text-field :rules="emailRule" label="Email Address" v-model="email"></v-text-field>
        <v-textarea :rules="requiredRule" auto-grow label="Suport Question" v-model="message"></v-textarea>
        <v-btn @click="submit" style="background-color: blue; color: white;"> Submit </v-btn>
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
      name: this.$store.state.user.principal.member.name || '',
      email: this.$store.state.user.principal.username || '',
      subject: '',
      message: '',
      success: false,
      error: false,
      requiredRule: [v => !!v || 'This field is required'],
      emailRule: [
        v => !!v || 'E-mail is required',
        v =>
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
          'E-mail must be valid'
      ]
    }
  },
  methods: {
    submit: async function() {
      this.error = false
      try {
        await this.$apollo.mutate({
          mutation: AddSupportTicket,
          variables: {
            tc: {
              name: this.name,
              email: this.email,
              message: this.message,
              subject: this.subject,
              tenantId: VUE_APP_TENANT_ID
            }
          },
          update(
            store,
            {
              data: { ticketCreate },
              error: { errors }
            }
          ) {
            if (errors) {
              this.error = errors[0]
            } else {
              this.success = `Your support ticket has been created. Your ticket number is ${
                ticketCreate.short
              }. For future reference please use this number.`
            }
          }
        })
      } catch (err) {
        this.error = err
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

.sup-form {
  height: 40%;
}
</style>
