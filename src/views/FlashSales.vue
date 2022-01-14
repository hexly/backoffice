<template>
  <div class="flash-sales">
    <v-data-table :headers="headers" :items="sales" class="elevation-1" hide-default-footer>
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>My Flash Sales</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">New Flash Sale</v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="text-h5">{{ formTitle }}</span>
              </v-card-title>
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field v-model="editedItem.name" label="Flash Sale Name"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-text-field v-model="editedItem.email" label="Host's Email"></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="save">Save</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="text-h5">Are you sure you want to delete this item?</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="deleteItemConfirm">OK</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:[`item.time`]="{ item }">
        {{formatDate(item.start)}} - {{formatDate(item.end)}}
      </template>
      <template v-slot:[`item.progress`]="{ item }">
        <v-progress-linear v-model="item.progress" :color="saleProgressColor(item)" height="25" rounded>
          <strong>{{saleProgressText(item)}}</strong>
        </v-progress-linear>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
        <v-icon small @click="deleteItem(item)">mdi-delete</v-icon>
      </template>
      <template v-slot:no-data>
        <v-btn color="primary" @click="initialize">Reset</v-btn>
      </template>
    </v-data-table>

    <!-- Attempt #2 -->
    <h2>My Flash Sales</h2>
    <div class="d-flex justify-left ma-2 flex-wrap">
      <div class="add-flash-sale-box">New Flash Sale</div>
      <v-card v-for="s in sales" :key="s.id" class="ma-2 sale-card">
        <v-list-item two-line>
          <v-list-item-content>
            <v-list-item-title class="text-h5">
              {{s.name}}
            </v-list-item-title>
            <v-list-item-subtitle><v-icon small color="#c44a42">calendar_today</v-icon>{{formatDate(s.start)}} - {{formatDate(s.end)}}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-card-text class="reward-info">
          <v-row align="center">
            <v-col cols="6">
              {{s.reward}}
              <br/>
              {{s.psv}} PSV Earned
            </v-col>
            <v-col cols="6">
              <v-btn :disabled="saleProgressText(s) !== 'Complete'">Claim Reward</v-btn>
            </v-col>
          </v-row>
          <v-row align="center">
            <v-col>
              <v-progress-linear v-model="s.progress" :color="saleProgressColor(s)" height="25" rounded>
                <strong>{{saleProgressText(s)}}</strong>
              </v-progress-linear>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn text>Resend Invite</v-btn>
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
      email: 0
    },
    defaultItem: {
      name: '',
      email: 0
    },
    sales: [
      {
        id: 1,
        name: 'Flash Sale 1',
        email: 'brenda.kradolfer@gmail.com',
        duration: '48 Hours',
        start: '2022-01-15',
        end: '2022-01-16',
        reward: '$100 Coupon',
        psv: '134',
        progress: 0
      },
      {
        id: 2,
        name: 'Flash Sale 2',
        email: 'narfdre@gmail.com',
        duration: '48 Hours',
        start: '2022-01-13',
        end: '2022-01-14',
        reward: '$10 Coupon',
        psv: '134',
        progress: 30
      },
      {
        id: 3,
        name: 'Flash Sale 3',
        email: 'david@davidwlech.co',
        duration: '48 Hours',
        start: '2022-01-11',
        end: '2022-01-12',
        reward: 'Free Mascara',
        psv: '0',
        progress: 0
      },
      {
        id: 4,
        name: 'Flash Sale 4',
        email: 'mckalee@everra.com',
        duration: '48 Hours',
        start: '2022-01-09',
        end: '2022-01-10',
        reward: 'Free Mascara',
        psv: '500',
        progress: 100
      }
    ]
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Flash Sale' : 'Edit Flash Sale'
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
      console.log(s, this.$moment(), this.$moment(s.end, 'YYYY-MM-DD'), this.$moment().isAfter(this.$moment(s.end, 'YYYY-MM-DD')))
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
    padding: 90px;
    margin-bottom: 10px;
    cursor: pointer;
    width: 350px;
  }

  .sale-card {
    border-radius: 15px;
    width: 350px;
    text-align: center;
  }

  .reward-info {
    background: #fff1f0;
  }
</style>
