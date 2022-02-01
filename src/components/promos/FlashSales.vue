<template>
  <div class="flash-sales">
    <h2>Flash Sales</h2>
    <div class="d-flex justify-center ma-2 flex-wrap">
      <v-dialog v-model="dialog" max-width="500px">
      <template v-slot:activator="{ on, attrs }">
        <div class="add-flash-sale-box d-flex align-center justify-center" v-on="on">
          <div class="text-center"><v-icon x-large>note_add</v-icon><br/>New Flash Sale</div>
        </div>
      </template>
      <v-card>
        <v-card-title>
          <span class="text-h5">New Flash Sale</span>
        </v-card-title>
        <v-card-text>
          <v-divider></v-divider>
          <v-container>
            <v-row>
              <v-col cols="12" class="pa-0">
                <v-text-field hide-details v-model="editedItem.name" label="Flash Sale Name"></v-text-field>
              </v-col>
              <v-col cols="12" class="pa-0">
                <v-menu
                  v-model="showDatePicker"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      hide-details
                      v-model="picker"
                      label="Flash Sale start date"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="picker"
                    @input="showDatePicker = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" class="pa-0">
              <v-menu
                ref="menu"
                v-model="timePicker"
                :close-on-content-click="false"
                :nudge-right="40"
                :return-value.sync="time"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="time"
                    label="Pick a time"
                    prepend-icon="mdi-clock-time-four-outline"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-time-picker
                  v-if="timePicker"
                  v-model="time"
                  full-width
                  @click:minute="$refs.menu.save(time)"
                ></v-time-picker>
              </v-menu>
              </v-col>
            </v-row>
          </v-container>
          <div class="current-reward">
            <span class="text-h5">Current Rewards</span>
            <br/>
            <div>Period: February 2022</div>
            <div>Length: 6 Hours</div>
            <br/>
            <div class="d-flex justify-space-around">
              <span class="text-h4">Goal</span>
              <span class="text-h4">Reward</span>
            </div>
            <v-divider></v-divider>
            <div class="d-flex justify-space-around">
              <span class="text-h6">500 PSV</span>
              <span class="text-h6">$100 Coupon</span>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="save">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
      <v-card v-for="s in sales" :key="s.id" class="ma-2 sale-card">
        <v-list-item two-line>
          <v-list-item-content>
            <v-list-item-title class="text-h5">
              {{s.name}}
            </v-list-item-title>
            <v-list-item-subtitle><v-icon small color="#c44a42">calendar_today</v-icon>{{formatDate(s.start)}} </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-card-text class="reward-info">
          <v-row align="center">
            <v-col cols="6">
              {{s.reward}}
              <br/>
              <span class="font-weight-bold">{{s.psv}} PSV</span> Earned
            </v-col>
            <v-col cols="6">
              <v-btn :disabled="saleProgressText(s) !== 'Complete' || s.claimed">{{s.claimed ? 'Claimed' : `Claim Reward`}}</v-btn>
            </v-col>
          </v-row>
          <v-row align="center">
            <v-col>
              <v-progress-linear :value="s.progress" :color="saleProgressColor(s)" height="25" rounded>
                <strong>{{saleProgressText(s)}}</strong>
              </v-progress-linear>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn text :disabled="saleProgressText(s) === 'Complete'">Copy Sale Link</v-btn>
          <v-spacer></v-spacer>
          <v-btn text color="red">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </div>
</template>
<script>
export default {
  data: () => ({
    dialog: false,
    dialogDelete: false,
    showDatePicker: false,
    time: null,
    timePicker: false,
    picker: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
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
    sales: [
      {
        id: 1,
        name: 'Flash Sale 1',
        email: 'brenda.kradolfer@gmail.com',
        duration: '48 Hours',
        start: '2022-01-27',
        end: '2022-01-29',
        reward: '$100 Coupon',
        psv: '134',
        progress: 0
      },
      {
        id: 2,
        name: 'Flash Sale 2',
        email: 'david@davidwlech.co',
        duration: '48 Hours',
        start: '2022-01-26',
        reward: 'Free Mascara',
        psv: '0',
        progress: 0
      },
      {
        id: 3,
        name: 'Flash Sale 3',
        email: 'narfdre@gmail.com',
        duration: '48 Hours',
        start: '2022-01-25',
        reward: '$10 Coupon',
        psv: '134',
        progress: 30
      },
      {
        id: 4,
        name: 'Flash Sale 4',
        email: 'mckalee@everra.com',
        duration: '48 Hours',
        start: '2022-01-11',
        reward: 'Free Mascara',
        psv: '500',
        progress: 100
      },
      {
        id: 5,
        name: 'Flash Sale 5',
        email: 'rachael@everra.com',
        duration: '48 Hours',
        start: '2022-01-09',
        reward: 'Free Mascara',
        psv: '500',
        progress: 100,
        claimed: true
      },
      {
        id: 6,
        name: 'Flash Sale 6',
        email: 'someone@everra.com',
        duration: '48 Hours',
        start: '2022-01-06',
        reward: 'Free Mascara',
        psv: '230',
        progress: 36,
        claimed: true
      }
    ]
  }),

  methods: {
    formatDate(date) {
      return this.$moment(date).format('MMM Do YYYY')
    },
    saleProgressText(s) {
      if (s.progress === 100) {
        return 'Complete'
      }
      if (s.progress < 100 && this.$moment().isAfter(this.$moment(s.end, 'YYYY-MM-DD'))) {
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
      if (s.progress < 100 && this.$moment().isAfter(this.$moment(s.end, 'YYYY-MM-DD'))) {
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
