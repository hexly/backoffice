<template>
  <div class="promo-links">
    <div class="d-flex justify-center ma-2 flex-wrap">
      <v-dialog v-model="dialog" max-width="500px">
        <v-card class="promo-link-modal pa-7">
          <v-card-title>
            <span class="text-h5 font-weight-bold">New Promo Link</span>
            <v-btn fab icon text absolute right top class="dialog-close-btn" @click="dialog = false"><v-icon>close</v-icon></v-btn>
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
                  <v-col cols="12" class="pt-1 promo-form-input">
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
                        color="primary"
                        :min="$moment().format('YYYY-MM-DD')"
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
                    <v-select
                      v-model="promoWindow"
                      :items="parsedWindows"
                      label="Promo Length"
                      :rules="requiredRule"
                    ></v-select>
                  </v-col>
                </v-row>
              </v-form>
              <!-- <p>{{ editedItem }}</p> -->
            </v-container>
            <div class="current-reward mt-4">
              <div v-if="selectedWindow">
                <div class="mb-3 font-weight-bold">Available Rewards</div>
                <div class="available-reward-table d-flex justify-start col-12">
                  <span class="text-h6 font-weight-light col-6 pt-0 pb-0">Goal</span>
                  <span class="text-h6 font-weight-light col-6 pt-0 pb-0">Reward</span>
                </div>
                <v-divider></v-divider>
                <div
                  v-for="reward in selectedWindow.rewards"
                  :key="reward.key"
                  class="available-reward-table d-flex justify-start col-12">
                  <span class="rewards-table-body-text col-6">{{reward.metadata.labels.en[marketKey].goal}}</span>
                  <span class="rewards-table-body-text col-6">{{reward.metadata.labels.en[marketKey].reward}}</span>
                </div>
              </div>
              <div v-else>
                <div class="available-reward-table d-flex justify-start col-12">
                  <span class="rewards-table-body-text pt-1">Please Select a Promo Length to view rewards</span>
                </div>
              </div>
            </div>
          </v-card-text>
          <v-card-actions class="pt-6">
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" text @click="close">Cancel</v-btn>
            <v-btn
              class="promo-link-save-btn font-weight-bold"
              outlined
              text
              @click="save"
              :disabled="!isFormValid"
              >Save</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="closeEventDialog" v-if="activePL" max-width="500px">
        <v-card>
          <v-card-title class="headline">
            <span class="subheading">End {{activePL.name}} Now?</span>
          </v-card-title>
          <v-card-text>
            <p class="mb-2">
              Are you sure you want to end this promo link now?
            </p>
          </v-card-text>
          <v-card-actions class="pt-6">
            <v-spacer></v-spacer>
            <v-btn text @click="closeDialog('closeEventDialog')">Cancel</v-btn>
            <v-btn
              color="red darken-1"
              class="promo-link-delete-btn font-weight-bold"
              outlined
              text
              @click="closePromoLink(activePL)"
              >End Now</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="claimDialog" v-if="activePL" max-width="500px">
        <v-card>
          <v-card-title class="headline">
            <span class="subheading">Claim Reward</span>
          </v-card-title>
          <v-card-text>
            <p class="mb-2 text-center font-weight-bold">
              Congratulations on reaching {{ ( activePL && activePL.claimableRewards[0] ) ? activePL.claimableRewards[0].progression.earned : null }} PSV!
            </p>
            <p class="mb-2">
              You are about to claim the <code>{{ ( activePL && activePL.claimableRewards[0] ) ? activePL.claimableRewards[0].reward.metadata.labels.en[marketKey].reward : null }}</code> for {{ activePL.host.label }}.
              They will receive an email with a coupon code that they can redeem at the Everra Store to get their reward.
            </p>
          </v-card-text>
          <v-card-actions class="pt-6">
            <v-btn text @click="closeDialog('claimDialog')">Cancel</v-btn>
            <v-spacer></v-spacer>
            <v-btn
              color="green"
              class="promo-link-delete-btn font-weight-bold"
              outlined
              text
              :disabled="claiming"
              :loading="claiming"
              @click="claimReward(activePL)"
              >Claim Reward</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-slide-x-transition group hide-on-leave>
        <v-progress-circular v-if="loading" key="progress" indeterminate />
        <div v-else key="done-loading">
          <v-row justify="center">
            <div
              class="add-flash-sale-box d-flex align-center justify-center"
              @click="dialog = true"
            >
              <div class="text-center">
                <v-icon x-large>note_add</v-icon><br />New Promo Link
              </div>
            </div>
            <v-card v-for="pl in promoLinks" :key="pl.id" class="sale-card ma-2" :loading="loading">
              <v-tooltip bottom open-delay="350">
                <template #activator="{ on, attrs }">
                  <v-btn v-on="on" v-bind="attrs" fab icon small absolute top right class="template-btn" @click="handleTemplateBtnClick(pl.template)">
                    <v-icon>info</v-icon>
                  </v-btn>
                </template>
                <span>Promo Details</span>
              </v-tooltip>
              <v-list-item two-line>
                <v-list-item-content class="pa-0">
                  <v-list-item-title class="text-h5 px-7 pt-2">
                    {{ pl.name }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    <v-icon small color="#c44a42" class="pr-1 pb-1">calendar_today</v-icon>
                    {{ formatDate(pl.startTime) }} - {{ formatDate(pl.endTime) }}
                  </v-list-item-subtitle>
                  <v-list-item-subtitle>
                    <v-icon small color="#c44a42" class="pr-1 pb-1">face</v-icon>
                    {{ pl.host.label }} ({{pl.host.email}})
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-card-text class="reward-info">
                <v-row v-if="progressToDisplay(pl) && marketKey">
                  <v-col cols="12" align="center">
                    <h2 class="font-weight-bold">{{ progressToDisplay(pl).progression.earned }} PSV Earned</h2>
                  </v-col>
                  <v-col cols="12" align="left">
                    <p class="green--text" :class="{ 'hidden': !rewardToDisplay(pl.rewards) }">
                      Earned: <span class="font-weight-bold" v-if="rewardToDisplay(pl.rewards)">{{ rewardToDisplay(pl.rewards).reward.metadata.labels.en[marketKey].reward }}</span>
                    </p>
                    <p :class="{ 'hidden': !nextReward(pl) }">
                      Next: <span class="font-weight-bold" v-if="nextReward(pl)">{{`${nextReward(pl).reward.metadata.labels.en[marketKey].reward} (${nextReward(pl).reward.metadata.labels.en[marketKey].goal})` }}</span>
                    </p>
                  </v-col>
                </v-row>
                <v-row v-else class="text--center">
                  <v-col cols="12">
                    Progress Data Unavailable
                  </v-col>
                </v-row>
                <p class="font-weight-bold">{{ pl.email }}</p>
                <v-row align="center" v-if="pl.rewards && pl.rewards.length && progressToDisplay(pl)">
                  <v-col class="pb-0" cols="12">
                    <v-btn
                      v-if="pl.isEligibleToClaim && pl.claimableRewards.length"
                      class="claim-reward-btn"
                      outlined
                      block
                      @click="showPLDialog('claimDialog', pl)"
                    >
                      Claim Reward
                    </v-btn>
                    <v-progress-linear
                      v-else
                      :value="progressToDisplay(pl).progression.progress * 100"
                      :color="progressColor(pl, progressToDisplay(pl))"
                      height="35"
                      rounded
                      class="card-progress-bar">
                        {{ progressText(pl, progressToDisplay(pl)) }}
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
                      class="link"
                    >
                      <v-tooltip slot="append" bottom>
                        <template v-slot:activator="{ on }">
                          <v-icon
                            v-if="canShare"
                            @click="shareLink(createPromoLink(pl.key))"
                            v-on="on"
                            color="black"
                            dark
                            >share</v-icon
                          >
                          <v-icon
                            v-else
                            @click="copyToClipboard(createPromoLink(pl.key))"
                            v-on="on"
                            color="black"
                            dark
                            >assignment</v-icon
                          >
                        </template>
                        <span v-if="canShare">{{ shareTooltipText }}</span>
                        <span v-else>{{ copyTooltipText }}</span>
                      </v-tooltip>
                    </v-text-field>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-actions>
                <v-btn v-if="!pl.isEligibleToClaim" text @click="resendEmailDialog('created', pl)">Resend Link</v-btn>
                <v-btn v-if="!pl.isEligibleToClaim" text :href="createPromoLink(pl.key)" target="_blank">Visit Link</v-btn>
                <v-btn v-if="pl.claimedRewards.length" text @click="resendEmailDialog('reward', pl)">Resend Reward</v-btn>
                <v-spacer></v-spacer>
                <v-btn v-if="pl.isEligibleToClaim && pl.claimableRewards.length" text color="green" @click="showPLDialog('claimDialog', pl)">Claim</v-btn>
                <v-btn v-else-if="['FINISHED_MANUALLY', 'FINISHED', 'ARCHIVED'].indexOf(pl.status) < 0" text color="orange" @click="showPLDialog('closeEventDialog', pl)">End Now</v-btn>
                <v-btn v-else-if="pl.status !== 'ARCHIVED'" text color="blue" @click="showPLDialog('archiveDialog', pl)">Archive</v-btn>
              </v-card-actions>
            </v-card>
          </v-row>
        </div>
      </v-slide-x-transition>
    </div>
    <v-row justify="center">
      <v-col cols="12">
        <v-pagination :value="currentPage" :length="totalPages" @input="newVal => $emit('paginationInput', newVal)"/>
      </v-col>
      <v-col cols="12" sm="2" class="px-5">
        <v-select :value="pageSize" :items="[5, 10, 25, 50]" label="Items Per Page" @input="newVal => $emit('pageSizeUpdate', newVal)" filled />
      </v-col>
    </v-row>
    <v-dialog v-model="emailDialog" v-if="dialogContext" max-width="500px">
      <v-card>
        <v-card-title class="headline">
          <span class="subheading">Resend {{dialogContext.reason}}</span>
        </v-card-title>
        <v-card-text>
          <p>
            Please confirm that you'd like to send {{dialogContext.email}} a new {{dialogContext.reason}}.
          </p>
        </v-card-text>
        <v-card-actions class="pt-6">
          <v-btn text @click="closeDialog('emailDialog')">Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            class="promo-link-delete-btn font-weight-bold"
            outlined
            text
            @click="sendEmail"
            >Send Email</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="archiveDialog" v-if="activePL" max-width="500px">
      <v-card>
        <v-card-title class="headline">
          <span class="subheading">Archive {{activePL.name}}</span>
        </v-card-title>
        <v-card-text>
          <p>
            Please confirm that you'd like to archive {{activePL.name}}.
          </p>
        </v-card-text>
        <v-card-actions class="pt-6">
          <v-btn text @click="closeDialog('archiveDialog')">Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            class="promo-link-delete-btn font-weight-bold"
            outlined
            text
            @click="handleArchiveClick"
            >Archive</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <PromoLinkDialog
      :showTemplateDialog="showTemplateDialog"
      :selectedTemplate="selectedTemplate"
      :marketKey="marketKey"
      @close="showTemplateDialog = false"
    />
  </div>
</template>
<script>
import _ from 'lodash'
import Rules from '@/views/Rules.js'
import { CreateMemberEvent, ClaimEventReward, ResendPromoEmails } from '@/graphql/MarketingEvent.gql'
import { mapGetters } from 'vuex'
import moment from 'moment'

import PromoLinkDialog from './PromoLinkDialog.vue'

export default {
  components: {
    PromoLinkDialog
  },
  props: {
    promoLinks: Array,
    eventTemplate: Object,
    currentPage: Number,
    pageSize: Number,
    totalPages: Number,
    totalResults: Number,
    loading: Boolean
  },
  data: () => ({
    dialog: false,
    closeEventDialog: false,
    archiveDialog: false,
    claimDialog: false,
    emailDialog: false,
    dialogContext: null,
    claiming: false,
    showDatePicker: false,
    timePicker: false,
    promoWindow: null,
    snackbarText: '',
    copyTooltipText: 'Copy',
    shareTooltipText: 'Share',
    showTemplateDialog: false,
    selectedTemplate: null,
    activePL: null,
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
    pickerTimeModel: moment().format('LT'),
    pickerDateModel: moment().format('LL'),
    editedItem: {
      promoName: '',
      hostEmail: '',
      hostName: '',
      date: moment().format('YYYY-MM-DD'),
      time: moment().format('HH:mm')
    }
  }),
  computed: {
    ...mapGetters(['memberId', 'displayName', 'slug', 'market']),
    canShare() {
      return navigator.share
    },
    marketKey() {
      const key = _.get(this, 'market.key')
      return key
    },
    parsedWindows() {
      if (!this.eventTemplate) {
        return []
      }

      const { windows } = this.eventTemplate
      if (!windows || !windows.length) {
        return []
      }
      const mappedWindows = windows.map((el) => {
        return {
          text: el.name,
          value: el.key
        }
      })

      return mappedWindows
    },
    selectedWindow() {
      if (
        !this.promoWindow ||
        !this.eventTemplate ||
        !this.eventTemplate.windows.length
      ) {
        return
      }

      return this.eventTemplate.windows.find(
        (el) => el.key === this.promoWindow
      )
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
    progressText(pl, reward) {
      if (!pl || !reward) {
        return
      }

      const claimed = pl.claimedRewards && pl.claimedRewards.length > 0
      return claimed ? 'Claimed' : pl.status.replace('_', ' ').toLowerCase()
    },
    progressColor(pl, reward) {
      if (!pl || !reward) {
        return
      }
      if (reward.progression.progress >= 100) {
        return 'green'
      }
      if (
        reward.progression.progress < 100 &&
        pl.status === 'FINISHED'
      ) {
        return 'orange'
      }
      if (pl.status === 'SCHEDULED') {
        return 'blue'
      }
      return 'green lighten-3'
    },
    rewardToDisplay(rewards) {
      if (!rewards || !rewards.length) {
        return
      }
      const rewardToDisplay = rewards.filter(el => el.progression.awarded)

      return rewardToDisplay[rewardToDisplay.length - 1]
    },
    nextReward(pl) {
      if (!pl.rewards || !pl.rewards.length || pl.claimedRewards.length > 0) {
        return
      }
      const awardedIndex = _.findIndex(pl.rewards, el => el.progression.awarded)
      if (pl.rewards[awardedIndex + 1]) {
        return pl.rewards[awardedIndex + 1]
      }
    },
    progressToDisplay(pl) {
      if (!pl.rewards || !pl.rewards.length) {
        return
      }

      const displayClaimed = [...pl.claimableRewards]
      const progressToDisplay = pl.rewards.filter(el => el.progression.visible || el.progression.claimed)
      return displayClaimed.length ? displayClaimed[0] : progressToDisplay[progressToDisplay.length - 1]
    },
    resendEmailDialog(context, pl) {
      switch (context) {
      case 'created':
        this.dialogContext = {
          action: 'created',
          reason: 'Promo Link email',
          email: pl.host.email,
          eventId: pl.id
        }
        break
      case 'reward':
        this.dialogContext = {
          rewardId: pl.claimedRewards[0].reward.id,
          reason: 'Reward email',
          email: pl.host.email,
          eventId: pl.id
        }
        break
      default:
        break
      }
      this.emailDialog = true
    },
    async sendEmail() {
      const input1 = {
        role: 'HOST'
      }
      if (this.dialogContext.action === 'created') {
        input1.lifecycleEvent = 'created'
      } else {
        input1.eventRewardId = this.dialogContext.rewardId
      }
      await this.$apollo.mutate({
        mutation: ResendPromoEmails,
        client: 'federated',
        variables: {
          input: {
            id: this.dialogContext.eventId
          },
          input1
        }
      })
      this.emailDialog = false
      this.dialogContext = null
    },
    closePromoLink(pl) {
      this.closeEventDialog = false
      this.$emit('closeEvent', pl)
    },
    showPLDialog(dialog, pl) {
      this.activePL = pl
      this[dialog] = true
    },
    closeDialog(dialog) {
      this[dialog] = false
    },
    close() {
      this.$refs.informationForm.reset()
      this.dialog = false
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
        const parsedDate = this.$moment(this.editedItem.date + 'T' + this.editedItem.time).toISOString()
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
        this.snackbarText =
          'There was an error creating this promo link! Please try again or contact support'
        console.error(error)
      }
      this.$emit('showSnackbar', this.snackbarText)
    },
    createPromoLink(eventKey) {
      const base = this.slug
        ? this.$tenantInfo.storeUrl.replace('{slug}', this.slug)
        : this.$tenantInfo.corporateUrl
      const link = base + `/promos/${eventKey}/`

      return link
    },
    handleMinutesClicked(time) {
      this.pickerTimeModel = this.$moment(this.editedItem.time, 'LT').format(
        'h:mm A'
      )
      this.timePicker = false
    },
    handleDatePickerInput(date) {
      this.pickerDateModel = this.$moment(date).format('LL')
      this.showDatePicker = false
    },
    shareLink(link) {
      navigator
        .share({ url: link })
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
    },
    handleTemplateBtnClick(template) {
      this.showTemplateDialog = true
      this.selectedTemplate = template
    },
    async claimReward(pl) {
      this.claiming = true
      const rewardIds = pl.claimableRewards.map(r => {
        return r.reward.id
      })
      await this.$apollo.mutate({
        mutation: ClaimEventReward,
        client: 'federated',
        variables: {
          input: {
            rewardIds,
            eventId: pl.id
          }
        }
      })
      pl.rewards.forEach(r => {
        if (rewardIds.includes(r.reward.id)) {
          r.progression.claimed = true
        }
      })
      pl.claimedRewards = pl.claimableRewards
      pl.isEligibleToClaim = false
      this.claimDialog = false
      this.claiming = false
    },
    handleArchiveClick() {
      this.$emit('archiveEvent', this.activePL)
      this.archiveDialog = false
    }
  }
}
</script>

<style scoped>
p {
  margin: 0;
}

/* .thisone {
  text-align: center;
} */
.v-card__text.reward-info {
  padding: 0 16px;
}
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

.template-btn {
  right: 3px;
  top: 3px !important;
}

.dialog-close-btn {
  top: 16px !important;
  right: 16px;
}

.earned-spacer {
  margin-top: 22px;
}
.card-progress-bar {
  font-weight: 600;
}

.claim-reward-btn {
  /* padding: 5px 110px; */
  padding: 6px 0;
  height: 35px;
  width: 318px;
  cursor: pointer;
  /* border: solid 1px rgba(255, 255, 255, 0); */
  background-color: rgba(255, 255, 255, 0.5);
  border: rgba(0, 0, 0, 0.8) 1px solid;
  border-radius: 4px;
}
.claim-reward-btn:hover {
  /* background-color: rgba(255, 153, 0, 0.7); */
  background-color: rgba(255, 255, 255, 0.8);
  border: rgba(0, 0, 0, 0.8) 1px solid;
  border-radius: 4px;
}
.hidden{
  visibility: hidden;
}

.promo-link-title {
  font-size: 20px;
  font-weight: bold;
}
</style>
