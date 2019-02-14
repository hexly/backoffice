<template>
  <v-flex xs12>
    <div class="about">
      <h1>Sales</h1>
      <v-card>
        <v-card-title class="headline font-weight-regular blue-grey white--text">Search</v-card-title>
        <v-card-text>
          <v-subheader>Range</v-subheader>
          <v-container grid-list-md text-xs-center>
            <v-layout row align-center justify-space-around wrap>
              <v-dialog
                ref="dialogStart"
                v-model="modalStart"
                :return-value.sync="startDate"
                lazy
                full-width
                width="290px"
              >
                <v-text-field
                  slot="activator"
                  v-model="startDate"
                  label="'Select Start Date'"
                  prepend-icon="event"
                  readonly
                ></v-text-field>
                <v-date-picker
                  ref="pickerStart"
                  color="blue-grey"
                  v-model="startDate"
                  :reactive="true"
                  @change="startDateChanged"
                />
              </v-dialog>
              <v-dialog
                ref="dialogEnd"
                v-model="modalEnd"
                :return-value.sync="endDate"
                lazy
                full-width
                width="290px"
              >
                <v-text-field
                  slot="activator"
                  v-model="endDate"
                  label="'Select Start Date'"
                  prepend-icon="event"
                  readonly
                ></v-text-field>
                <v-date-picker
                  ref="pickerEnd"
                  color="blue-grey"
                  v-model="endDate"
                  :reactive="true"
                  @change="endDateChanged"
                />
              </v-dialog>
            </v-layout>
          </v-container>
        </v-card-text>
      </v-card>
      <v-data-table
        :headers="headers"
        :items="items"
        hide-actions
        class="elevation-1"
        item-key="id"
        expand
        :loading="loading"
      >
        <template slot="items" slot-scope="props">
          <tr @click="props.expanded = !props.expanded">
            <td>
              <a>Details</a>
            </td>
            <td>{{ props.item.date }}</td>
            <td>${{ props.item.total }}</td>
            <td>{{ props.item.totalPoints }}</td>
            <td>{{ props.item.commissionableAmount }}</td>
            <td>{{ props.item.commissionablePoints }}</td>
            <td>{{ props.item.displayName }}</td>
            <td>{{ props.item.sellerEmail }}</td>
          </tr>
        </template>
        <template slot="expand" slot-scope="props">
          <div class="pa-3 sale-details">
            <v-container fluid>
              <v-layout>
                <v-flex xs4>
                  <h4>Details:</h4>
                  <ul>
                    <li>Originating ID: {{props.item.providerOid}}</li>
                    <li>Status: {{props.item.status}}</li>
                    <li>Customer Note: {{props.item.customerNote}}</li>
                  </ul>
                </v-flex>
                <v-flex xs4>
                  <h4>Customer Info:</h4>
                  <ul>
                    <li>{{props.item.shippingFirstName}} {{props.item.shippingLastName}}</li>
                    <li>{{props.item.shippingAddress1}}</li>
                    <li>{{props.item.shippingAddress2}}</li>
                    <li>{{props.item.shippingCity}}, {{props.item.shippingState}} {{props.item.shippingZip}}</li>
                  </ul>
                </v-flex>
                <v-flex xs4>
                  <h4>Billing Info:</h4>
                  <ul>
                    <li>{{props.item.billingFirstName}} {{props.item.billingLastName}}</li>
                    <li>{{props.item.billingAddress1}}</li>
                    <li>{{props.item.billingAddress2}}</li>
                    <li>{{props.item.billingCity}}, {{props.item.billingState}} {{props.item.billingZip}}</li>
                  </ul>
                </v-flex>
              </v-layout>
              <v-layout>
                <v-flex xs12>
                  <h4>Line Items</h4>
                  <ul>
                    <li
                      v-for="line in props.item.lineItems"
                      :key="line.id"
                    >{{line.name}} ({{line.total}})</li>
                  </ul>
                </v-flex>
              </v-layout>
            </v-container>
          </div>
        </template>
      </v-data-table>
    </div>
  </v-flex>
</template>

<script>
import DateSelector from '@/components/DateSelector.vue'
import SEARCH_SALES_QUERY from '@/graphql/SearchSales.gql'
import { map } from 'ramda'
import moment from 'moment'

const tenantId = ~~process.env.VUE_APP_TENANT_ID

export default {
  components: {
    DateSelector
  },
  data() {
    return {
      loading: true,
      modalStart: false,
      modalEnd: false,
      startDate: moment()
        .startOf('week')
        .format('YYYY-MM-DD'),
      endDate: moment()
        .endOf('week')
        .format('YYYY-MM-DD'),
      headers: [
        {
          text: 'Show Details',
          value: 'string',
          align: 'left',
          sortable: false
        },
        { text: 'Date', value: 'date' },
        { text: 'Sale Total', value: 'total' },
        { text: 'Total Points', value: 'points' },
        { text: 'Commissionable Total', value: 'comTotal' },
        { text: 'Commissionable Points', value: 'comPoints' },
        { text: 'Seller Name', value: 'displayName' },
        { text: 'Seller Email', value: 'contactEmail' }
      ],
      sales: []
    }
  },
  apollo: {
    sales: {
      query: SEARCH_SALES_QUERY,
      variables() {
        console.log('apollo SEARCH_SALES_QUERY called');

        return {
          saleSearchInput: {
            sellerId: this.$store.state.user.principal.memberId,
            tenantId,
            query: null,
            endDate: this.endDate,
            startDate: this.startDate
          }
        }
      },
      error(err) {
        this.loading = false;
        console.log(this.loading);
        console.log({ err });
      },
      debounce: 500,
      update({ searchSalesBySellerId }) {
        this.loading = false;
        return searchSalesBySellerId
      }
    }
  },
  methods: {
    startDateChanged(date) {
      this.$refs.dialogStart.save(date);
    },
    endDateChanged(date) {
      this.$refs.dialogEnd.save(date);
    }
  },
  computed: {
    items() {
      return map(sale => {
        // return {
        //   ...sale,
        //   id: sale.saleId,
        //   date: moment(sale.awardedDate, 'YYYY-MM-DD').format('MM/DD/YYYY')
        // }
      }, this.sales)
    }
  }
}
</script>

<style scoped>
.sale-details ul li {
  list-style: none;
}
a {
  cursor: pointer;
}
</style>
