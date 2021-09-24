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
      <v-flex xs12 md4 v-for="(a,i) in model" :key="i">
        <AddressCard
          :address="a"
          :saving="a.saving"
          @save="save"
          @remove="remove"
          :canDelete="model.length > 1"
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
import { cloneDeep, get } from 'lodash'

import { ADDRESS_BY_MEMBER_SEARCH, UPDATE_ADDRESS, DELETE_ADDRESS, CREATE_ADDRESS } from '@/graphql/Address.js'
import AddressCard from '@/components/profile/AddressCard.vue'

export default {
  name: 'Addresses',
  components: {
    AddressCard
  },
  data() {
    return {
      addresses: [],
      model: [],
      loadingAddresses: 0
    }
  },
  methods: {
    add() {
      const newAddress = this.addresses.find(a => a.new)
      const _addresses = [ ...this.addresses ]
      if (!newAddress) {
        _addresses.push({
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
      this.addresses = [ ..._addresses ]
    },
    async save(address) {
      const mutation = address.new ? CREATE_ADDRESS : UPDATE_ADDRESS
      const _address = { ...address }
      delete _address.saving
      delete _address.new

      this.model = this.model.map(a => {
        if (a.id === address.id) {
          return { ...address, saving: true }
        }
        return a
      })

      try {
        const res = await this.$apollo.mutate({
          mutation,
          variables: {
            input: {
              ..._address,
              type: address.type.toUpperCase(),
              contactId: this.contactId,
              memberId: this.principal.memberId
            }
          },
          client: 'federated'
        })
        const dataPath = address.new ? 'data.membership.createAddress' : 'data.membership.updateAddress'
        const updateAddress = get(res, dataPath)

        this.model = this.model.map(a => {
          if (a.id === updateAddress.id || (address.new && !a.id)) {
            return {
              ...updateAddress,
              new: false,
              type: a.type
            }
          }

          return a
        })

        await this.$apollo.queries.addresses.refetch()
        this.$emit('addressSnackBarEmitSuccess', 'Address successfully updated')
        this.$emit('hasAddress', { type: 'address', isSet: true })
      } catch (err) {
        console.error({ err })
        this.$emit(
          'addressSnackBarEmitError',
          'Unable to save address information'
        )
      }
    },
    async remove(address) {
      if (address.new && !address.id) {
        this.model = this.model.filter(a => !a.new)
      } else {
        this.model = this.model.map(a => {
          if (a.id === address.id) {
            return { ...address, saving: true }
          }
          return a
        })

        try {
          const { id: addressId } = address
          const res = await this.$apollo.mutate({
            mutation: DELETE_ADDRESS,
            variables: {
              input: {
                addressId,
                contactId: this.contactId
              }
            },
            client: 'federated'
          })
          const deleteAddress = get(res, 'data.membership.deleteAddress')
          this.model = this.model.filter(a => a.id !== deleteAddress.id)

          this.$emit('addressSnackBarEmitSuccess', 'Address successfully updated')
        } catch (err) {
          console.error({ err })
          this.$emit(
            'addressSnackBarEmitError',
            'Unable to save address information'
          )
        }
      }

      await this.$apollo.queries.addresses.refetch()
    }
  },
  apollo: {
    addresses: {
      query: ADDRESS_BY_MEMBER_SEARCH,
      client: 'federated',
      variables () {
        return {
          input: {
            idIn: [this.memberId],
            tenantIn: [this.$tenantId]
          }
        }
      },
      update (data) {
        const addresses = get(data, 'membership.search.results.0.contacts.0.addresses')
        return addresses
      },
      loadingKey: 'loadingAddresses',
      skip() {
        return !this.memberId
      }
    }
  },
  computed: {
    ...mapState({
      principal: state => state.user.principal
    }),
    ...mapGetters(['contactId', 'memberId'])
  },
  watch: {
    addresses(newVal) {
      this.model = cloneDeep(newVal)
    }
  }
}
</script>

<style scoped>

</style>
