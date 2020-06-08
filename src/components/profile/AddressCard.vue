<template>
  <v-card class="address-card ma-1" :class="{'shrink': (!editMode && action), 'grow': editMode}">
    <v-card-text>
      <div class="text-left" v-if="!editMode">
        <span class="font-weight-bold headline">{{address.name}}</span>
        <v-btn text small class="grey--text" disabled>{{address.type}}</v-btn>
        <p>
          <span>{{address.street}}</span>
          <br v-if="address.street2"/>
          <span v-if="address.street2">{{address.street2}}</span>
          <br/>
          <span>{{address.city}}, {{address.province}} {{address.postalCode}}</span>
          <br/>
          <span>{{address.country}}</span>
        </p>
        <v-divider class="mt-1"></v-divider>
        <v-card-actions>
          <template v-if="canDelete">
            <v-btn :disabled="saving" :loading="saving" text small class="red--text text--lighten-1" @click="remove">
              Delete
              <v-icon right dark>delete</v-icon>
            </v-btn>
          </template>
          <template v-else>
            <v-tooltip slot="append" bottom>
              <template v-slot:activator="{ on }">
                <v-btn disabled v-on="on" text small class="grey--text">
                  Delete
                  <v-icon right dark>delete</v-icon>
                </v-btn>
              </template>
              <span>You must have alteast one address</span>
            </v-tooltip>
          </template>
          <v-spacer/>
          <v-btn :disabled="saving" text small class="grey--text" @click="edit">
            Edit
            <v-icon right dark>edit</v-icon>
          </v-btn>
        </v-card-actions>
      </div>
      <div v-else>
        <v-form
        ref="addressForm"
        @submit.prevent="save"
        lazy-validation
        >
        <v-text-field
          label="Name"
          name="Name"
          v-model="editAddress.name"
          :rules="requiredRule"
          required
        ></v-text-field>
        <v-text-field
          label="Street"
          name="Street"
          v-model="editAddress.street"
          :rules="requiredRule"
          required
        ></v-text-field>
        <v-text-field
          label="Street 2"
          name="Street 2"
          v-model="editAddress.street2"
        ></v-text-field>
        <v-text-field
          label="City"
          name="City"
          v-model="editAddress.city"
          :rules="requiredRule"
          required
        ></v-text-field>
        <v-text-field
          label="State/Province"
          name="State/Province"
          v-model="editAddress.province"
          :rules="requiredRule"
          required
        ></v-text-field>
        <v-text-field
          label="Postal Code"
          name="Postal Code"
          v-model="editAddress.postalCode"
          :rules="requiredRule"
          required
        ></v-text-field>
        <v-select
          label="Country"
          name="Country"
          v-model="editAddress.country"
          :rules="requiredRule"
          required
          :items="countries"
        ></v-select>
        <v-select
          label="Address Type"
          name="Type"
          v-model="editAddress.type"
          :rules="requiredRule"
          required
          :items="types"
        ></v-select>
        <v-divider class="mt-5"></v-divider>
        <v-card-actions>
          <v-btn :disabled="saving" text @click="cancel">Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn :disabled="saving" :loading="saving" color="primary" text @click="save">Save</v-btn>
        </v-card-actions>
        </v-form>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import Rules from '@/views/Rules.js'

export default {
  name: 'AddressCard',
  props: {
    address: Object,
    saving: {
      type: Boolean,
      default: false
    },
    canDelete: {
      type: Boolean,
      default: false
    }
  },
  mounted() {
    if (this.address.new) {
      this.edit()
    }
  },
  data() {
    return {
      editMode: false,
      editAddress: null,
      action: false,
      requiredRule: Rules.requiredRule,
      countries: [
        { text: 'United States of America', value: 'US' },
        { text: 'United Kingdom', value: 'GB' }
      ],
      types: [
        { text: 'Shipping', value: 'shipping' },
        { text: 'Billing', value: 'billing' }
      ]
    }
  },
  methods: {
    edit() {
      this.action = true
      this.editMode = true
      this.editAddress = { ...this.address }
    },
    save() {
      if (this.$refs.addressForm.validate()) {
        this.$emit('save', this.editAddress)
      }
    },
    cancel() {
      if (this.address.new) {
        this.$emit('remove', this.address)
      }
      this.editMode = false
    },
    remove() {
      this.$emit('remove', this.address)
    }
  },
  watch: {
    'address.new': {
      handler(newVal, oldVal) {
        if (newVal) {
          this.editMode = true
        } else {
          this.editMode = false
        }
      },
      deep: true

    }
  }
}
</script>

<style scoped>
.address-card {
  overflow: hidden;
}
.shrink{
  height: 196px;
  animation: shrinking .4s cubic-bezier(.62,-0.02,.56,1.18);
}

.grow{
  height: 677px;
  animation: growing .4s cubic-bezier(.62,-0.02,.56,1.18);
}

@keyframes shrinking {
  0%   { height: 677px; }
  /* 10%  { height: 675px; } */
  /* 90%  { transform: scaleX(1.02) }
  100% { height: 196px; transform: scaleX(1) } */
  100% { height: 196px; }
}

@keyframes growing {
  0%   { height: 196px; }
  /* 10%  { height: 130px; } */
  /* 90%  { transform: scaleX(.98) }
  100% { height: 677px; transform: scaleX(1) } */
  100% { height: 677px; }
}
</style>
