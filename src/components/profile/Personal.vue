<template>
  <v-slide-x-transition group hide-on-leave>
    <div :key="1" v-if="model">
      <v-form ref="informationForm" @submit.prevent="saveData" class="pa-1">
        <v-row wrap>
          <v-col cols="12" md="4">
            <slot name="profilePic"></slot>
          </v-col>
          <v-col cols="12" md="8">
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
          </v-col>
        </v-row>
        <v-text-field
          class="pb-2"
          label="Legal Name"
          v-model.trim="model.name"
          :rules="requiredRule"
          hint="This is used for all legal documents"
          persistent-hint
        ></v-text-field>
        <v-text-field
          class="pb-2"
          label="Display Name"
          v-model.trim="model.displayName"
          :rules="requiredRule"
          hint="This is used to display publicly on your replicated site"
          persistent-hint
        ></v-text-field>
        <v-text-field
          class="pb-2"
          label="Username"
          v-model.trim="model.username"
          :rules="emailRule"
          hint="This is used to log into your backoffice"
          persistent-hint
        ></v-text-field>
        <v-text-field
          label="Contact E-mail"
          v-model.trim="model.contactEmail.email"
          :rules="emailRule"
          required
        ></v-text-field>
        <v-dialog
          ref="dialog"
          v-model="datePickerModal"
          lazy
          full-width
          width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-on="on"
              v-model="model.birthdate"
              label="Date of Birth"
              prepend-icon="event"
              readonly
              :rules="birthdateRule"
            ></v-text-field>
          </template>
          <v-date-picker
            scrollable
            v-model ="datePickerDate"
            ref     ="picker"
          >
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="datePickerModal = false">Cancel</v-btn>
            <v-btn text color="primary" @click="dateSave(datePickerDate); $refs.dialog.save()">OK</v-btn>
          </v-date-picker>
        </v-dialog>
        <!-- <v-text-field
          v-model="value.birthdate"
          label="Date of Birth"
          :placeholder="this.birthdayFormat"
          :rules="birthdateRule"
        ></v-text-field> -->
      <v-btn
        :disabled="saving"
        :loading="saving"
        color="primary"
        type="submit"
      >Save Personal Info</v-btn>
      </v-form>
    </div>
    <div :key="2" v-else>
      <v-progress-circular value="true" indeterminate></v-progress-circular>
    </div>
  </v-slide-x-transition>
</template>

<script>
import Rules from '@/views/Rules.js'

export default {
  props: {
    value: {
      type: Object,
      required: true
    },
    saveData: {
      type: Function,
      required: true
    },
    saving: Boolean
  },
  data () {
    return {
      model: null,
      datePickerDate: null,
      datePickerModal: false,
      requiredRule: Rules.requiredRule,
      emailRule: Rules.emailRule,
      birthdateRule: Rules.birthdateRule,
      birthdayFormat: Rules.birthdayFormat
    }
  },
  methods: {
    validateForm() {
      if (this.$refs.informationForm.validate()) {
        this.saveData()
      }
    },
    dateSave(datePickerDate) {
      this.model.birthdate = this.$moment(datePickerDate).format(this.birthdayFormat)
    }
  },
  watch: {
    value(newVal) {
      const { birthdate } = newVal

      this.model = newVal
      this.dateSave(birthdate)
    }
  }
}
</script>
