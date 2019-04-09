<template>
  <div>
    <v-form ref="informationForm">
      <v-text-field
        label="Name"
        v-model="value.name"
        required
      ></v-text-field>
      <v-text-field
        label="E-mail"
        v-model="value.contactEmail"
        required
      ></v-text-field>
      <v-text-field
        label="Display name"
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
      <v-dialog
        ref="dialog"
        v-model="modal"
        :return-value.sync="value.birthdate"
        lazy
        full-width
        width="290px"
      >
        <v-text-field
          slot="activator"
          :rules="birthdateRule"
          v-model="value.formattedDate"
          label="Date of Birth"
          prepend-icon="event"
          readonly
        ></v-text-field>
        <v-date-picker
          ref="picker"
          color="green lighten-1"
          v-model="value.birthdate"
          :reactive="true"
          :max="moment().format('YYYY-MM-DD')"
          min="1900-01-01"
          @change="saveDate"
        ></v-date-picker>
      </v-dialog>

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
      color="success"
      @click="saveData"
    >Save Information</v-btn>
  </div>
</template>

<script>

import moment from 'moment'
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
    saveDate: {
      type: Function,
      required: true
    },
    saveData: {
      type: Function,
      required: true
    },
    saving: Boolean,
    modal: Boolean,
    slugIsUnique: Boolean,
    slugErrors: Array,
    originalSlug: String
  },
  data () {
    return {
      moment,
      slugRule: Rules.slugRule,
      birthdateRule: Rules.birthdateRule
    }
  }
}
</script>
