<template>
  <div>
    <v-form ref="informationForm" @submit.prevent="saveData">
      <v-text-field
        label="First Name"
        v-model.trim="value.firstName"
        :rules="requiredRule"
        required
      ></v-text-field>
      <v-text-field
        label="Last Name"
        v-model.trim="value.lastName"
        :rules="requiredRule"
        required
      ></v-text-field>
      <v-text-field
        class="pb-2"
        label="Legal Name"
        v-model.trim="value.name"
        :rules="requiredRule"
        hint="This is used for all legal documents"
        persistent-hint
      ></v-text-field>
      <v-text-field
        class="pb-2"
        label="Display Name"
        v-model.trim="value.displayName"
        :rules="requiredRule"
        hint="This is used to display publicly on your replicated site"
        persistent-hint
      ></v-text-field>
      <v-text-field
        class="pb-2"
        label="Username"
        v-model.trim="value.username"
        :rules="emailRule"
        hint="This is used to log into your backoffice"
        persistent-hint
      ></v-text-field>
      <v-text-field
        label="Contact E-mail"
        v-model.trim="value.contactEmail.email"
        :rules="emailRule"
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
    <v-btn
      :disabled="saving"
      :loading="saving"
      color="primary"
      type="submit"
    >Save Personal Info</v-btn>
    </v-form>
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
      requiredRule: Rules.requiredRule,
      slugRule: Rules.slugRule,
      emailRule: Rules.emailRule,
      birthdateRule: [
        v => this.$moment(v, 'MM/DD/YYYY').isValid() || 'Birthday Must Be in MM/DD/YYYY Format'
      ]
    }
  },
  methods: {
    validateForm() {
      if (this.$refs.informationForm.validate()) {
        this.saveData()
      }
    }
  }
}
</script>
