<template>
  <div class="about">
    <h1>Your Profile</h1>
    <v-container grid-list-md text-xs-center>
      <v-layout row wrap>
        <v-flex xs6>
          <div class="mx-auto">
            <h2>Your Information</h2>
          </div>
          <v-form>
            <v-text-field
              label="Name"
              v-model="name"
              required
            ></v-text-field>
            <v-text-field
              label="E-mail"
              v-model="email"
              required
            ></v-text-field>
            <v-text-field
              label="Display name"
              v-model="displayName"
              required
            ></v-text-field>
            <v-text-field
              name="password"
              label="Enter your password"
              hint="At least 8 characters"
              v-model="password"
              min="8"
              :append-icon="visible ? 'visibility_off' : 'visibility'"
              :append-icon-cb="() => (visible = !visible)"
              :type="visible ? 'text' : 'password'"
            ></v-text-field>
          </v-form>
        </v-flex>
        <v-flex xs6>
          <div class="mx-auto">
            <h2>Profile Image</h2>
            <img src=""/>
          </div>
        </v-flex>
      </v-layout>
      <v-btn color="success" @click="snackbar = true">Save</v-btn>
    </v-container>
    <v-snackbar
      :timeout="6000"
      :top="true"
      :right="true"
      v-model="snackbar"
    >
      Information Saved
      <v-btn flat color="pink" @click.native="snackbar = false">Close</v-btn>
    </v-snackbar>
  </div>
</template>

<script>
export default {
  data: () => ({
    visible: false,
    name: '',
    email: '',
    displayName: '',
    password: '',
    snackbar: false
  })
}
</script>
