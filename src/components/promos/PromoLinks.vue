<template>
  <div class="promo-links">
    <div class="ma-5">
      <h1>Promo Links</h1>
      <h2 class="font-weight-regular">Manage and create promotional events.</h2>
    </div>
    <div class="d-flex justify-center ma-2 flex-wrap">
      <v-dialog v-model="dialog" max-width="500px">
        <template v-slot:activator="{ on }">
          <div class="add-flash-sale-box d-flex align-center justify-center"
            v-on="on">
            <div class="text-center">
              <v-icon x-large>note_add</v-icon><br />New Promo Link
            </div>
          </div>
        </template>
        <v-card class="promo-link-modal">
          <v-card-title>
            <span class="text-h5 font-weight-bold">New Promo Link</span>
          </v-card-title>
          <v-card-text>
            <p class="mb-2">
              Promo Links allow you to have a host promote your store and give
              them a reward for reaching the required threshold.
            </p>
            <v-container>
              <v-form ref="informationForm" v-model="isFormValid">
                <v-row class="mt-1">
                  <v-col cols="12" class="promo-form-input">
                    <v-text-field
                      v-model="editedItem.promoName"
                      label="Promo Link Name"
                      :rules="requiredRule"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" class="pt-0 promo-form-input">
                    <v-text-field
                      type="email"
                      v-model="editedItem.hostName"
                      label="Promoter's Name"
                      :rules="requiredRule"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" class="pt-0 promo-form-input">
                    <v-text-field
                      type="email"
                      v-model="editedItem.hostEmail"
                      label="Promoter's Email"
                      :rules="emailRule"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" class="pt-1">
                    <v-menu
                      v-model="showDatePicker"
                      :close-on-content-click="false"
                      :nudge-right="40"
                      transition="scale-transition"
                      offset-y
                      min-width="auto"
                    >
                      <template v-slot:activator="{ on, attrs }" class="pb-0">
                        <v-text-field
                          v-model="pickerDateModel"
                          label="Promo Start Date"
                          prepend-icon="mdi-calendar"
                          readonly
                          v-bind="attrs"
                          v-on="on"
                          :rules="requiredRule"
                          class="date-picker-input"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="editedItem.date"
                        @input="handleDatePickerInput"
                      ></v-date-picker>
                    </v-menu>
                  </v-col>
                  <v-col cols="12" class="pt-0">
                    <v-menu
                      ref="menu"
                      v-model="timePicker"
                      :close-on-content-click="false"
                      :nudge-right="40"
                      transition="scale-transition"
                      offset-y
                      max-width="290px"
                      min-width="290px"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="pickerTimeModel"
                          label="Promo Start Time"
                          prepend-icon="mdi-clock-outline"
                          readonly
                          :rules="requiredRule"
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-time-picker
                        v-if="timePicker"
                        v-model="editedItem.time"
                        full-width
                        @click:minute="handleMinutesClicked"
                      ></v-time-picker>
                    </v-menu>
                  </v-col>
                  <v-col cols="12" class="pt-0">
                    <v-select v-model="promoWindow" :items="parsedWindows" label="Promo Length" :rules="requiredRule"></v-select>
                  </v-col>
                </v-row>
              </v-form>
              <!-- <p>{{ editedItem }}</p> -->
            </v-container>
            <div class="current-reward mt-4">
              <div v-if="selectedWindow">
                <span class="text-h6 font-weight-bold">Available Rewards</span>
                <br />
                <p>Period: February 2022</p>
                <div class="available-reward-table d-flex justify-start col-12">
                  <span class="text-h6 font-weight-light col-6 pt-0 pb-0">Goal</span>
                  <span class="text-h6 font-weight-light col-6 pt-0 pb-0">Reward</span>
                </div>
                <v-divider></v-divider>
                <div v-for="reward in selectedWindow.rewards" :key="reward.key" class="available-reward-table d-flex justify-start col-12">
                  <span class="rewards-table-body-text col-6">{{reward.name.split('Reward:')[0]}}</span>
                  <span class="rewards-table-body-text col-6">{{reward.name.split('Reward:')[1]}}</span>
                </div>
              </div>
              <div v-else>
                <div class="available-reward-table d-flex justify-start col-12">
                  <span class="rewards-table-body-text">Please Select a Promo Length to view rewards</span>
                </div>
              </div>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" text @click="close">Cancel</v-btn>
            <v-btn
              class="promo-link-save-btn font-weight-bold"
              outlined
              text
              @click="save"
              :disabled="!isFormValid"
              >Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-card v-for="pl in promoLinks" :key="pl.id" class="ma-2 sale-card">
        <v-list-item two-line>
          <v-list-item-content>
            <v-list-item-title class="text-h5">
              {{ pl.name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              <v-icon small color="#c44a42">calendar_today</v-icon>
                {{ formatDate(pl.startTime) }} - {{ formatDate(pl.endTime) }}
              </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-card-text class="reward-info">
          <v-row align="center">
            <v-col cols="6">
              {{ pl.reward }}
              <br />
              <p class="font-weight-light">{{ pl.psv || 0 }} PSV Earned</p>
            </v-col>
            <v-col cols="6">
              <v-btn
                :disabled="saleProgressText(pl) !== 'Complete' || pl.claimed"
                >{{ pl.claimed ? "Claimed" : `Claim Reward` }}</v-btn
              >
            </v-col>
          </v-row>
          <p class="font-weight-bold">{{ pl.email }}</p>
          <v-row align="center">
            <v-col>
              <v-progress-linear
                :value="pl.progress"
                :color="saleProgressColor(pl)"
                height="25"
                rounded
              >
                <strong>{{ saleProgressText(pl) }}</strong>
              </v-progress-linear>
            </v-col>
          </v-row>
          <v-row align="center">
            <v-col>
              <v-text-field
                solo
                color="black"
                :value="createPromoLink(pl.key)"
                readonly
                single-line
                hide-details
                class="link">
                <v-tooltip slot="append" bottom>
                    <template v-slot:activator="{ on }">
                      <v-icon v-if="canShare" @click="shareLink(createPromoLink(pl.key))" v-on="on" color="black" dark>share</v-icon>
                      <v-icon v-else @click="copyToClipboard(createPromoLink(pl.key))" v-on="on" color="black" dark>assignment</v-icon>
                    </template>
                    <span v-if="canShare">{{shareTooltipText}}</span>
                    <span v-else>{{copyTooltipText}}</span>
                </v-tooltip>
              </v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <!-- <v-btn text :disabled="saleProgressText(pl) === 'Complete'">Resend Link</v-btn> -->
          <v-btn text disabled>Resend Link</v-btn>
          <a :href="createPromoLink(pl.key)" target="_blank">
            <v-btn text>Visit Link</v-btn>
          </a>
          <v-spacer></v-spacer>
          <!-- <v-btn text color="red">Delete</v-btn> -->
          <v-btn text disabled color="red">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </div>
    <v-snackbar v-model="showSnackbar">
      {{snackbarText}}
      <v-btn
        text
        color="primary"
        @click.native="showSnackbar = false"
      >Close</v-btn>
    </v-snackbar>
  </div>
</template>
<script>
import Rules from '@/views/Rules.js'
import { CreateMemberEvent } from '@/graphql/CreateMemberEvent.gql'
import { mapGetters } from 'vuex'

export default {
  props: {
    promoLinks: Array,
    eventTemplate: Object
  },
  data: () => ({
    dialog: false,
    dialogDelete: false,
    showDatePicker: false,
    timePicker: false,
    promoWindow: null,
    showSnackbar: false,
    snackbarText: '',
    copyTooltipText: 'Copy',
    shareTooltipText: 'Share',

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
    isFormValid: false,
    requiredRule: Rules.requiredRule,
    emailRule: Rules.emailRule,
    pickerTimeModel: '',
    pickerDateModel: '',
    editedItem: {
      promoName: '',
      hostEmail: '',
      hostName: '',
      date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .substr(0, 10),
      time: ''
      // emailRule: Rules.emailRule,
    }
    // defaultItem: {
    //  name: "",
    //  email: "",
    //  time: "",
    // },
  }),
  computed: {
    ...mapGetters(['memberId', 'displayName', 'slug']),
    canShare() {
      return navigator.share
    },
    parsedWindows() {
      if (!this.eventTemplate) {
        return []
      }

      const { windows } = this.eventTemplate
      if (!windows || !windows.length) {
        return []
      }
      const mappedWindows = windows.map(el => {
        return {
          text: el.name,
          value: el.key
        }
      })

      return mappedWindows
    },
    selectedWindow() {
      if (!this.promoWindow || !this.eventTemplate || !this.eventTemplate.windows.length) {
        return
      }

      return this.eventTemplate.windows.find(el => el.key === this.promoWindow)
    }
  },
  methods: {
    validateForm() {
      if (this.$refs.informationForm.validate()) {
        this.saveData()
      }
    },
    formatDate(date) {
      return this.$moment(date).format('MMM Do YYYY')
    },
    saleProgressText(pl) {
      if (pl.progress === 100) {
        return 'Complete'
      }
      if (
        pl.progress < 100 &&
        this.$moment().isAfter(this.$moment(pl.endTime, 'YYYY-MM-DD'))
      ) {
        return 'Expired'
      }
      if (this.$moment().isBefore(this.$moment(pl.startTime, 'YYYY-MM-DD'))) {
        return 'Upcoming'
      }
      return 'In Progress'
    },
    saleProgressColor(pl) {
      if (pl.progress === 100) {
        return 'green'
      }
      if (
        pl.progress < 100 &&
        this.$moment().isAfter(this.$moment(pl.endTime, 'YYYY-MM-DD'))
      ) {
        return 'orange'
      }
      if (this.$moment().isBefore(this.$moment(pl.startTime, 'YYYY-MM-DD'))) {
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
      this.$refs.informationForm.reset()
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
    async save() {
      if (this.editedIndex > -1) {
        Object.assign(this.desserts[this.editedIndex], this.editedItem)
      } else {
        this.desserts.push(this.editedItem)
      }

      try {
        const parsedDate = this.$moment.utc(this.editedItem.date + 'T' + this.editedItem.time).format()
        console.log({ parsedDate })
        await this.$apollo.mutate({
          mutation: CreateMemberEvent,
          client: 'federated',
          variables: {
            input: {
              name: this.editedItem.promoName,
              startTime: parsedDate,
              window: this.promoWindow,
              type: 'HOSTED_SALE',
              template: 'promo_link',
              participants: [
                {
                  pii: { email: this.editedItem.hostEmail },
                  label: this.editedItem.hostName,
                  role: 'HOST'
                },
                {
                  memberId: this.memberId,
                  label: this.displayName,
                  role: 'ORGANIZER'
                }
              ]
            }
          }
        })
        this.snackbarText = 'Promo Link Created!'
        this.close()
        this.$emit('refetchPromoLinks')
      } catch (error) {
        this.snackbarText = 'There was an error creating this promo link! Please try again or contact support'
        console.error(error)
      }
      this.showSnackbar = true
    },
    createPromoLink(eventKey) {
      const base = this.slug ? this.$tenantInfo.storeUrl.replace('{slug}', this.slug) : this.$tenantInfo.corporateUrl
      const link = base + `/promos/${eventKey}/`

      return link
    },
    handleMinutesClicked(time) {
      this.pickerTimeModel = this.$moment(this.editedItem.time, 'HH:mm').format('h:mm A')
      this.timePicker = false
    },
    handleDatePickerInput(date) {
      this.pickerDateModel = this.$moment(date).format('LL')
      this.showDatePicker = false
    },
    shareLink(link) {
      navigator.share({ url: link })
        .then(() => {
          this.copyTooltipText = 'Shared'
          setTimeout(() => {
            this.copyTooltipText = 'Share'
          }, 3000)
        })
        .catch((error) => console.log('Error sharing', error))
    },
    async copyToClipboard(link) {
      await this.$copyText(link)
      this.copyTooltipText = 'Copied!'
      setTimeout(() => {
        this.copyTooltipText = 'Copy'
      }, 3000)
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

.add-flash-sale-box:hover {
  background-color: rgba(86, 86, 86, 0.4);
}

.v-card__title,
.sale-card {
  border-radius: 15px;
  width: 350px;
  text-align: center;
}

/* START fine tuning spacing aka: vuetify override  */

.promo-link-modal .v-card__text {
  padding: 0 10px;
}
.promo-link-modal .v-card__title {
  padding: 10px 10px 0;
}
.promo-link-modal .v-card__actions {
  padding: 5px 10px 10px;
}
.promo-form-input.col.col-12 {
  padding-top: 0;
  padding-bottom: 0;
}
.date-picker-input .col,
.col-12 {
  padding-bottom: 0 !important;
}

.available-reward-table.col-12,
.available-reward-table.col-12.col-6 {
  padding: 0 !important;
}
/* END fine tuning spacing */

.rewards-table-body-text {
  font-size: 18px;
  font-weight: 600;
}
/* .promo-link-save-btn.theme--light.v-btn.v-btn--outlined.v-btn--text {
  border-color: black;
} */
</style>
