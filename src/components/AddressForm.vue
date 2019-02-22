<template>
  <div>
    <v-form
      ref="addressForm"
      @submit.prevent="save()"
      lazy-validation
    >
      <v-text-field
        label="Street"
        name="Street"
        v-model="address.street"
        :rules="requiredRule"
        required
      ></v-text-field>
      <v-text-field
        label="Street 2"
        name="Street 2"
        v-model="address.street2"
      ></v-text-field>
      <v-text-field
        label="City"
        name="City"
        v-model="address.city"
        :rules="requiredRule"
        required
      ></v-text-field>
      <v-text-field
        label="State/Province"
        name="State/Province"
        v-model="address.province"
        :rules="requiredRule"
        required
      ></v-text-field>
      <v-text-field
        label="Postal Code"
        name="Postal Code"
        v-model="address.postalCode"
        :rules="digitsOnlyRule"
        required
      ></v-text-field>
      <v-text-field
        label="Country"
        name="Country"
        :v-model="address.country"
        :rules="requiredRule"
        required
        value="USA"
        disabled
      ></v-text-field>
      <v-btn
        :disabled="saving"
        :loading="saving"
        type="submit"
        color="success"
      >Save Address</v-btn>
    </v-form>
  </div>
</template>

<script>
import { ADDRESS_BY_MEMBER_ID, UPDATE_ADDRESS } from '@/graphql/Address.js'
export default {
  name: 'AddressForm',
  data () {
    return {
      address: {
        id: null,
        name: null,
        street: null,
        city: null,
        province: null,
        country: null,
        postalCode: null,
        street2: null
      },
      requiredRule: [v => !!v || 'Field is required'],
      digitsOnlyRule: [
        v => !!v || 'Field is required',
        v => /^[\d]+(?:-[\d]+)*$/.test(v) || 'Field can only be digits'
      ],
      saving: false
    }
  },
  mounted () {
    console.log('Mounted called', this)
  },
  apollo: {
    address: {
      query: ADDRESS_BY_MEMBER_ID,
      variables () {
        return {
          addressMemberId: {
            memberId: this.$store.state.user.principal.memberId
          }
        }
      },
      update ({ addressByMemberOrTenant }) {
        if (addressByMemberOrTenant) {
          return Object.assign({}, addressByMemberOrTenant[0])
        } else {
          console.log('No address info found')
        }
      }
    }
  },
  methods: {
    async save () {
      if (this.$refs.addressForm.validate()) {
        this.saving = true
        const ProfileObject = this.$parent.$parent.$parent.$parent.$parent

        try {
          await this.$apollo.mutate({
            mutation: UPDATE_ADDRESS,
            variables: {
              addressInput: {
                id: this.address.id,
                name: ProfileObject.editMember.name,
                street: this.address.street,
                city: this.address.city,
                province: this.address.province,
                country: this.address.country || 'US',
                postalCode: this.address.postalCode,
                street2: this.address.street2 || '',
                memberId: this.$store.state.user.principal.memberId
              }
            },
            update: (store, { data: { updateAddress } }) => {
              this.saving = false
              this.address = updateAddress
              this.$emit('addressSnackBarEmitSuccess', 'Address successfully updated')
            }
          })
        } catch (err) {
          console.log({ err })
          this.saving = false
          this.$emit(
            'addressSnackBarEmitError',
            'Unable to save address information'
          )
        }
      } else {
        this.saving = false
        this.$emit(
          'addressSnackBarEmitError',
          'One or more fields were filled out incorrectly'
        )
      }
    }
  }
}
</script>
