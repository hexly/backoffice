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
            v-if="eventTemplates"
            :promo-links="promoLinks"
            :eventTemplate="
              eventTemplates.find((el) => el.key === 'promo_link')
            "
            :currentPage="currentPage"
            :pageSize="pageSize"
            :totalPages="totalPages"
            :totalResults="totalResults"
            :loading="loading"
            @refetchPromoLinks="handlePromoLinksRefetch"
            @closeEvent="handleCloseEvent"
            @archiveEvent="handleArchiveEvent"
            @paginationInput="handlePaginationInput"
            @pageSizeUpdate="handlePageSizeUpdate"
            @showSnackbar="handleShowSnackbar"
          />
        </v-lazy>
      </v-tab-item>
    </v-tabs>
    <v-snackbar v-model="showSnackbar">
      {{ snackbarText }}
      <v-btn text color="primary" @click.native="showSnackbar = false">Close</v-btn>
    </v-snackbar>
  </div>
</template>

<script>
import PromoLinks from '@/components/promos/PromoLinks.vue'
import FlashSales from '@/components/promos/FlashSales.vue'
import { GetMemberEvents } from '@/graphql/GetMemberEvents.gql'
import { GetEventTemplates } from '@/graphql/GetEventTemplates.gql'
import { CloseEvent } from '@/graphql/CloseEvent.gql'
import { mapGetters } from 'vuex'
import { get } from 'lodash'

export default {
  components: {
    PromoLinks,
    FlashSales
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
      { text: 'Actions', value: 'actions', sortable: false }
    ],
    desserts: [],
    editedIndex: -1,
    editedItem: {
      name: '',
      email: ''
    },
    defaultItem: {
      name: '',
      email: ''
    },
    statusFilter: [ 'SCHEDULED', 'IN_PROGRESS', 'FINISHED', 'FINISHED_MANUALLY' ],
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalResults: 0,
    showSnackbar: false,
    snackbarText: ''
  }),
  computed: {
    ...mapGetters(['memberId']),
    loading() {
      return this.$apollo.loading
    }
  },
  apollo: {
    promoLinks: {
      client: 'federated',
      query: GetMemberEvents,
      variables() {
        return {
          input: {
            idIn: [this.memberId]
          },
          marketingInput: {
            statusIn: this.statusFilter,
            evaluate: true,
            page: this.currentPage,
            pageSize: this.pageSize
          }
        }
      },
      update(data) {
        const promoLinks = get(
          data,
          'membership.search.results.0.events.marketing.results'
        )
        this.totalPages = get(data, 'membership.search.results.0.events.marketing.totalPages')
        this.totalResults = get(data, 'membership.search.results.0.events.marketing.totalResults')
        return promoLinks.map((pl) => {
          // they're only eligible to claim if they're done (for now)
          pl.isEligibleToClaim = pl.status === 'FINISHED'
          pl.participants.map((p) => {
            pl[p.role.toLowerCase()] = p
          })

          // what rewards are waiting to be claimed
          pl.claimableRewards = (pl.rewards || []).filter(
            (r) =>
              r.progression && // make sure we get some json object
              r.progression.awarded && // make sure they earned the reward
              r.progression.claimed !== true
          ) // make sure they haven't claimed it

          pl.claimedRewards = (pl.rewards || []).filter(
            (r) =>
              r.progression &&
              r.progression.claimed === true
          )

          return pl
        })
      }
    },
    eventTemplates: {
      client: 'federated',
      query: GetEventTemplates,
      update(data) {
        return get(data, 'marketing.searchEventTemplates.results')
      }
    }
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
    handlePromoLinksRefetch() {
      this.$apollo.queries.promoLinks.refetch()
    },
    async handleCloseEvent(pl) {
      const id = pl.id
      try {
        await this.$apollo.mutate({
          mutation: CloseEvent,
          client: 'federated',
          variables: {
            input: {
              id
            },
            setStatusInput: {
              status: 'FINISHED_MANUALLY'
            }
          }
        })
        this.$apollo.queries.promoLinks.refetch()
        this.snackbarText = 'Event closed!'
      } catch (error) {
        console.error(error)
        this.snackbarText = 'There was a problem closing that event. Please try again or contact support'
      }
      this.showSnackbar = true
    },
    async handleArchiveEvent(pl) {
      const id = pl.id
      try {
        await this.$apollo.mutate({
          mutation: CloseEvent,
          client: 'federated',
          variables: {
            input: {
              id
            },
            setStatusInput: {
              status: 'ARCHIVED'
            }
          }
        })
        this.$apollo.queries.promoLinks.refetch()
        this.snackbarText = 'Event archived!'
      } catch (error) {
        console.error(error)
        this.snackbarText = 'There was a problem archiving that event. Please try again or contact support'
      }
      this.showSnackbar = true
    },
    handlePaginationInput(newVal) {
      this.currentPage = newVal
    },
    handlePageSizeUpdate(newVal) {
      this.currentPage = 1
      this.pageSize = newVal
    },
    handleShowSnackbar(snackbarText) {
      this.snackbarText = snackbarText
      this.showSnackbar = true
    }
  }
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
