<template>
  <div class="pa-4">
    <v-layout v-if="loadingAddresses > 0 && addresses.length === 0" row justify-center>
      <v-flex xs12 sm6 md4>
        <p class="headline">Getting your addresses</p>
         <v-progress-linear
            color="secondary"
            indeterminate
            rounded
            height="6"
          ></v-progress-linear>
      </v-flex>
    </v-layout>
    <v-layout v-if="loadingAddresses === 0 && addresses.length === 0" row justify-center>
      <v-flex xs12 sm6 md4>
        <p class="headline">You have no addresses in our system. Press the plus button to add one.</p>
      </v-flex>
    </v-layout>
    <v-layout v-else row wrap justify-left>
      <v-flex xs12 md4 v-for="(a,i) in addresses" :key="i">
        <AddressCard
          :address="a"
          :saving="a.saving"
          @save="save"
          @remove="remove"
          :canDelete="addresses.length > 1"
        />
      </v-flex>
    </v-layout>
    <v-btn
      color="primary"
      dark
      absolute
      top
      right
      fab
      @click="add"
    >
      <v-icon>add</v-icon>
    </v-btn>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { ADDRESS_BY_CONTACT_ID, UPDATE_ADDRESS, DELETE_ADDRESS } from '@/graphql/Address.js'
import AddressCard from '@/components/profile/AddressCard.vue'

const tenantId = ~~process.env.VUE_APP_TENANT_ID

export default {
  name: 'Addresses',
  components: {
    AddressCard
  },
  data() {
    return {
      addresses: [],
      loadingAddresses: 0
    }
  },
  methods: {
    add() {
      const newAddress = this.addresses.find(a => a.new)
      if (!newAddress) {
        this.addresses.push({
          name: '',
          street: '',
          city: '',
          province: '',
          country: '',
          postalCode: '',
          street2: '',
          new: true,
          saving: false
        })
      }
    },
    async save(address) {
      this.addresses = this.addresses.map(a => {
        if (a.id === address.id) {
          return { ...address, saving: true }
        }
        return a
      })
      const { data: { updateAddress } } = await this.$apollo.mutate({
        mutation: UPDATE_ADDRESS,
        variables: {
          addressInput: {
            ...address,
            saving: undefined, // removing from query
            new: undefined, // removing from query
            type: address.type.toUpperCase(),
            contactId: this.contactId,
            memberId: this.principal.memberId
          }
        }
      })
      this.addresses = this.addresses.map(a => {
        if (a.id === updateAddress.id || (address.new && !a.id)) {
          return {
            ...updateAddress,
            saving: false,
            new: false,
            type: a.type
          }
        }
        return a
      })
    },
    async remove(address) {
      if (address.new && !address.id) {
        this.addresses = this.addresses.filter(a => !a.new)
      } else {
        this.addresses = this.addresses.map(a => {
          if (a.id === address.id) {
            return { ...address, saving: true }
          }
          return a
        })
        const { data: { deleteAddress } } = await this.$apollo.mutate({
          mutation: DELETE_ADDRESS,
          variables: {
            addressInput: {
              ...address,
              saving: undefined, // removing from query
              new: undefined, // removing from query
              type: address.type.toUpperCase(),
              contactId: this.contactId,
              memberId: this.principal.memberId
            }
          }
        })
        this.addresses = this.addresses.filter(a => a.id !== deleteAddress.id)
      }
    }
  },
  apollo: {
    addresses: {
      query: ADDRESS_BY_CONTACT_ID,
      variables () {
        return {
          addressContactId: {
            contactId: this.contactId,
            tenantId
          }
        }
      },
      update ({ addressByContactOrTenant }) {
        return addressByContactOrTenant
      },
      loadingKey: 'loadingAddresses',
      skip() {
        return !this.contactId
      }
    }
  },
  computed: {
    ...mapState({
      principal: state => state.user.principal
    }),
    ...mapGetters(['contactId'])
  }
}
</script>

<style scoped>

</style>
