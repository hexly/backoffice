<template>
  <div>
    <v-form ref="informationForm">
      <v-text-field
        label="Legal Name"
        v-model="value.name"
        required
      ></v-text-field>
      <v-text-field
        label="E-mail"
        v-model="value.contactEmail"
        required
      ></v-text-field>
      <v-text-field
        label="Display Name"
        v-model="value.displayName"
        required
      ></v-text-field>
      <v-text-field
        label="Slug / Store Name"
        class="mb-3"
        v-model="value.slug"
        @keyup="slugChanged"
        :rules="slugRule"
        :error-messages="slugErrors"
        required
        :disabled="!!originalSlug"
        persistent-hint
        :hint="`https://www.mygreenhorizen.com/store/${value.slug || '{your_store_name}'}`"
      ></v-text-field>
      <v-text-field
        v-model="value.birthdate"
        label="Date of Birth"
        placeholder="MM/DD/YYYY"
        :rules="birthdateRule"
      ></v-text-field>

      <!-- <v-text-field
                  name="password"
                  label="Enter your password"
                  hint="At least 8 characters"
                  v-model="password"
                  min="8"
                  :append-icon="visible ? 'visibility_off' : 'visibility'"
                  :append-icon-cb="() => (visible = !visible)"
                  :type="visible ? 'text' : 'password'"
                ></v-text-field>-->
    </v-form>
    <v-btn
      :disabled="saving"
      :loading="saving"
      color="primary"
      @click="saveData"
    >Save Information</v-btn>
  </div>
</template>

<script>

import Rules from '../views/Rules.js'

export default {
  props: {
    value: {
      type: Object,
      required: true
    },
    slugChanged: {
      type: Function,
      required: true
    },
    saveData: {
      type: Function,
      required: true
    },
    saving: Boolean,
    slugIsUnique: Boolean,
    slugErrors: Array,
    originalSlug: String
  },
  data () {
    return {
      slugRule: Rules.slugRule,
      birthdateRule: [
        v => this.$moment(v).isValid() || 'Birthday Must Be in MM/DD/YYYY Format'
      ]
    }
  }
}
</script>
