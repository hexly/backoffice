<template>
  <div class="promo-center">
    <v-tabs centered background-color="secondary" dark icons-and-text>
      <v-tabs-slider color="white"></v-tabs-slider>
      <v-tab to="#links"
        >Promo links
        <v-icon>offline_share</v-icon>
      </v-tab>
      <v-tab-item value="links" class="py-3">
        <v-lazy>
          <PromoLinks
            :promo-links="promoLinks"
            @refetchPromoLinks="handlePromoLinksRefetch"
            :eventTemplate="
              eventTemplates.find((el) => el.key === 'promo_link')
            "
          />
        </v-lazy>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import PromoLinks from '@/components/promos/PromoLinks.vue'
import FlashSales from '@/components/promos/FlashSales.vue'
import { GetMemberEvents } from '@/graphql/GetMemberEvents.gql'
import { GetEventTemplates } from '@/graphql/GetEventTemplates.gql'
import { mapGetters } from 'vuex'
import { get } from 'lodash'

export default {
  components: {
    PromoLinks,
    FlashSales,
  },
  data: () => ({
    dialog: false,
    dialogDelete: false,
    showDatePicker: false,
    picker: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .substr(0, 10),
    headers: [
      { text: 'Name', sortable: false, value: 'name' },
      { text: 'Email', value: 'email' },
      { text: 'Duration', value: 'duration' },
      { text: 'Time', value: 'time' },
      { text: 'PSV', value: 'psv' },
      { text: 'Reward', value: 'reward' },
      { text: 'Progress', value: 'progress', sortable: false },
      { text: 'Actions', value: 'actions', sortable: false },
    ],
    desserts: [],
    editedIndex: -1,
    editedItem: {
      name: '',
      email: '',
    },
    defaultItem: {
      name: '',
      email: '',
    },
    statusFilter: null,
    eventTemplates: [],
  }),
  computed: {
    ...mapGetters(['memberId']),
  },
  apollo: {
    promoLinks: {
      client: 'federated',
      query: GetMemberEvents,
      variables() {
        return {
          input: {
            idIn: [this.memberId],
          },
          marketingInput: {
            statusIn: this.statusFilter,
          },
        }
      },
      update(data) {
        const promoLinks = get(
          data,
          'membership.search.results.0.events.marketing.results'
        )
        return promoLinks
      },
    },
    eventTemplates: {
      client: 'federated',
      query: GetEventTemplates,
      update(data) {
        console.log({ data })
        return get(data, 'marketing.searchEventTemplates.results')
      },
    },
  },
  methods: {
    formatDate(date) {
      return this.$moment(date).format('MMM Do YYYY')
    },
    saleProgressText(s) {
      if (s.progress === 100) {
        return 'Complete'
      }
      if (
        s.progress < 100 &&
        this.$moment().isAfter(this.$moment(s.end, 'YYYY-MM-DD'))
      ) {
        return 'Expired'
      }
      if (this.$moment().isBefore(this.$moment(s.start, 'YYYY-MM-DD'))) {
        return 'Upcoming'
      }
      return 'In Progress'
    },
    saleProgressColor(s) {
      if (s.progress === 100) {
        return 'green'
      }
      if (
        s.progress < 100 &&
        this.$moment().isAfter(this.$moment(s.end, 'YYYY-MM-DD'))
      ) {
        return 'orange'
      }
      if (this.$moment().isBefore(this.$moment(s.start, 'YYYY-MM-DD'))) {
        return 'blue'
      }
      return 'green lighten-3'
    },
    editItem(item) {
      this.editedIndex = this.desserts.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    deleteItem(item) {
      this.editedIndex = this.desserts.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },
    deleteItemConfirm() {
      this.desserts.splice(this.editedIndex, 1)
      this.closeDelete()
    },
    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },
    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },
    save() {
      if (this.editedIndex > -1) {
        Object.assign(this.desserts[this.editedIndex], this.editedItem)
      } else {
        this.desserts.push(this.editedItem)
      }
      this.close()
    },
    handlePromoLinksRefetch() {
      this.$apollo.queries.promoLinks.refetch()
    },
  },
}
</script>

<style scoped>
.add-flash-sale-box {
  border-radius: 15px;
  border: 5px dashed #ccc;
  margin: 10px;
  cursor: pointer;
  min-width: 350px;
}

.sale-card {
  border-radius: 15px;
  width: 350px;
  text-align: center;
}

.reward-info {
  background: #fff1f0;
}

.current-reward {
  background: #ccc;
  margin: 25px -24px 0 -24px;
  padding: 10px;
  box-shadow: #333 inset -1px 0px 3px -1px;
}
</style>