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
      <v-form>
        <p style="color: black;"><strong>Questions? Chat with us!</strong></p>
        <v-text-field label="Name" v-model="name"></v-text-field>
        <v-text-field label="Email Address" v-model="email"></v-text-field>
        <v-textarea auto-grow label="Suport Question" v-model="message"></v-textarea>
        <v-btn @click="submit" style="background-color: blue; color: white;"> Submit </v-btn>
      </v-form>
    </v-alert>
  </div>
</template>

<script>
import AddSupportTicket from '@/graphql/AddSupportTicket.gql'

  export default {
    name: 'SupportWidget',  
    data() {
      return {
        alert: false,
        name: '',
        email: '',
        message: ''
      }
    },
    methods: {
      submit: async function() {
        try {
        await this.$apollo.mutate({
          mutation: AddSupportTicket,
          variables: {tc: {name:this.name, email:this.email, message:this.message}},
          update(args) {
            
          }
        })
        }
        catch (err) {
          console.error(err)
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
