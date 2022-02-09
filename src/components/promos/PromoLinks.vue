<template>
	<div class="promo-links">
		<div class="ma-5">
			<h1>Promo Links</h1>
			<h2 class="font-weight-regular">Manage and create promotional events.</h2>
		</div>
		<div class="d-flex justify-center ma-2 flex-wrap">
			<v-dialog v-model="dialog" max-width="500px">
				<template v-slot:activator="{ on, attrs }">
					<div
						class="add-flash-sale-box d-flex align-center justify-center"
						v-on="on"
					>
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
											v-model="editedItem.name"
											label="Promo Link Name"
											:rules="requiredRule"
										></v-text-field>
									</v-col>
									<v-col cols="12" class="pt-0 promo-form-input">
										<v-text-field
											type="email"
											v-model="email"
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
													v-model="editedItem.picker"
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
												v-model="editedItem.picker"
												@input="showDatePicker = false"
											></v-date-picker>
										</v-menu>
									</v-col>
									<v-col cols="12" class="pt-0">
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
													v-model="editedItem.time"
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
												@click:minute="$refs.menu.save(time)"
											></v-time-picker>
										</v-menu>
									</v-col>
								</v-row>
							</v-form>
							<!-- <p>{{ editedItem }}</p> -->
						</v-container>
						<div class="current-reward mt-4">
							<span class="text-h6 font-weight-bold">Available Rewards</span>
							<br />
							<p>Period: February 2022</p>

							<div class="available-reward-table d-flex justify-start col-12">
								<span class="text-h6 font-weight-light col-6 pt-0 pb-0"
									>Goal</span
								>
								<span class="text-h6 font-weight-light col-6 pt-0 pb-0"
									>Reward</span
								>
							</div>
							<v-divider></v-divider>

							<div class="available-reward-table d-flex justify-start col-12">
								<span class="rewards-table-body-text col-6">500 PSV</span>
								<span class="rewards-table-body-text col-6">$100 Coupon</span>
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
							>Save</v-btn
						>
					</v-card-actions>
				</v-card>
			</v-dialog>
			<v-card v-for="s in sales" :key="s.id" class="ma-2 sale-card">
				<v-list-item two-line>
					<v-list-item-content>
						<v-list-item-title class="text-h5">
							{{ s.name }}
						</v-list-item-title>
						<v-list-item-subtitle
							><v-icon small color="#c44a42">calendar_today</v-icon
							>{{ formatDate(s.start) }} -
							{{ formatDate(s.end) }}</v-list-item-subtitle
						>
					</v-list-item-content>
				</v-list-item>
				<v-card-text class="reward-info">
					<v-row align="center">
						<v-col cols="6">
							{{ s.reward }}
							<br />
							<p class="font-weight-light">{{ s.psv }} PSV</p>
							Earned
						</v-col>
						<v-col cols="6">
							<v-btn
								:disabled="saleProgressText(s) !== 'Complete' || s.claimed"
								>{{ s.claimed ? "Claimed" : `Claim Reward` }}</v-btn
							>
						</v-col>
					</v-row>
					<p class="font-weight-bold">{{ s.email }}</p>
					<v-row align="center">
						<v-col>
							<v-progress-linear
								:value="s.progress"
								:color="saleProgressColor(s)"
								height="25"
								rounded
							>
								<strong>{{ saleProgressText(s) }}</strong>
							</v-progress-linear>
						</v-col>
					</v-row>
				</v-card-text>
				<v-card-actions>
					<v-btn text :disabled="saleProgressText(s) === 'Complete'"
						>Resend Link</v-btn
					>
					<v-spacer></v-spacer>
					<v-btn text color="red">Delete</v-btn>
				</v-card-actions>
			</v-card>
		</div>
	</div>
</template>
<script>
import Rules from "@/views/Rules.js"

export default {
	data: () => ({
		dialog: false,
		dialogDelete: false,
		showDatePicker: false,
		timePicker: false,

		headers: [
			{ text: "Name", sortable: false, value: "name" },
			{ text: "Email", value: "email" },
			{ text: "Duration", value: "duration" },
			{ text: "Time", value: "time" },
			{ text: "PSV", value: "psv" },
			{ text: "Reward", value: "reward" },
			{ text: "Progress", value: "progress", sortable: false },
			{ text: "Actions", value: "actions", sortable: false },
		],
		desserts: [],
		editedIndex: -1,
		isFormValid: false,
		requiredRule: Rules.requiredRule,
		emailRule: Rules.emailRule,
		editedItem: {
			name: "",
			email: "",
			picker: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
				.toISOString()
				.substr(0, 10),
			time: "",
			// emailRule: Rules.emailRule,
		},
		// defaultItem: {
		// 	name: "",
		// 	email: "",
		// 	time: "",
		// },

		sales: [
			{
				id: 1,
				name: "Promo Link 1",
				email: "brenda.kradolfer@gmail.com",
				duration: "48 Hours",
				start: "2022-01-27",
				end: "2022-01-29",
				reward: "$100 Coupon",
				psv: "134",
				progress: 0,
			},
			{
				id: 2,
				name: "Promo Link 2",
				email: "david@davidwlech.co",
				duration: "48 Hours",
				start: "2022-01-26",
				end: "2022-01-28",
				reward: "Free Mascara",
				psv: "0",
				progress: 0,
			},
			{
				id: 3,
				name: "Promo Link 3",
				email: "narfdre@gmail.com",
				duration: "48 Hours",
				start: "2022-01-25",
				end: "2022-01-27",
				reward: "$10 Coupon",
				psv: "134",
				progress: 30,
			},
			{
				id: 4,
				name: "Promo Link 4",
				email: "mckalee@everra.com",
				duration: "48 Hours",
				start: "2022-01-11",
				end: "2022-01-12",
				reward: "Free Mascara",
				psv: "500",
				progress: 100,
			},
			{
				id: 5,
				name: "Promo Link 5",
				email: "rachael@everra.com",
				duration: "48 Hours",
				start: "2022-01-09",
				end: "2022-01-11",
				reward: "Free Mascara",
				psv: "500",
				progress: 100,
				claimed: true,
			},
			{
				id: 6,
				name: "Promo Link 6",
				email: "someone@everra.com",
				duration: "48 Hours",
				start: "2022-01-06",
				end: "2022-01-08",
				reward: "Free Mascara",
				psv: "230",
				progress: 36,
				claimed: true,
			},
		],
	}),

	methods: {
		validateForm() {
			if (this.$refs.informationForm.validate()) {
				this.saveData()
			}
		},
		formatDate(date) {
			return this.$moment(date).format("MMM Do YYYY")
		},
		saleProgressText(s) {
			if (s.progress === 100) {
				return "Complete"
			}
			if (
				s.progress < 100 &&
				this.$moment().isAfter(this.$moment(s.end, "YYYY-MM-DD"))
			) {
				return "Expired"
			}
			if (this.$moment().isBefore(this.$moment(s.start, "YYYY-MM-DD"))) {
				return "Upcoming"
			}
			return "In Progress"
		},
		saleProgressColor(s) {
			if (s.progress === 100) {
				return "green"
			}
			if (
				s.progress < 100 &&
				this.$moment().isAfter(this.$moment(s.end, "YYYY-MM-DD"))
			) {
				return "orange"
			}
			if (this.$moment().isBefore(this.$moment(s.start, "YYYY-MM-DD"))) {
				return "blue"
			}
			return "green lighten-3"
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
		save() {
			if (this.editedIndex > -1) {
				Object.assign(this.desserts[this.editedIndex], this.editedItem)
			} else {
				this.desserts.push(this.editedItem)
			}
			this.close()
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
.v-card__title,
.sale-card {
	border-radius: 15px;
	width: 350px;
	text-align: center;
}

/* START fine tuning spacing aka: vuetify override  */

.promo-link-modal .v-card__text {
	padding: 0 30px;
}
.promo-link-modal .v-card__title {
	padding: 30px 30px 0;
}
.promo-link-modal .v-card__actions {
	padding: 20px 30px 30px;
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
