<template>
  <div class="customers">
    <v-row>
        <v-col cols="12" sm="4">
          <v-slide-x-transition>
            <v-card v-if="customers" color="secondary">
              <v-card-title class="white--text title-bar-card" primary-title>
                {{customers.length}}
              </v-card-title>
              <v-card-text class="white--text">
                Total Customers
              </v-card-text>
            </v-card>
          </v-slide-x-transition>
        </v-col>
        <v-col cols="12" sm="4">
          <v-slide-x-transition>
            <v-card v-if="mostRecentOrder" color="secondary" @click="handleRecentOrderClick">
              <v-card-title class="white--text title-bar-card" primary-title>
                {{$moment(mostRecentOrder.recentOrder, 'YYYY-MM-DD').format('ll')}} ({{mostRecentOrder.customerName && /[^\s]/.test(mostRecentOrder.customerName) ? mostRecentOrder.customerName : 'Guest Customer'}})
              </v-card-title>
              <v-card-text class="white--text">
                Most Recent Order
              </v-card-text>
            </v-card>
          </v-slide-x-transition>
        </v-col>
        <v-col cols="12" sm="4">
          <v-slide-x-transition>
            <v-card v-if="mostOrderedItem" color="secondary">
              <v-card-title class="white--text title-bar-card" primary-title>
                {{mostOrderedItem.name}}
              </v-card-title>
              <v-card-text class="white--text">
                Most Ordered Item
              </v-card-text>
            </v-card>
          </v-slide-x-transition>
        </v-col>
    </v-row>
    <v-row wrap>
      <v-col xs="12">
        <v-flex>
          <v-card>
            <v-toolbar color="secondary" dark>
              <v-toolbar-title>Customers</v-toolbar-title>
              <v-spacer/>
            </v-toolbar>
            <v-card-text class="px-2 customer-list">
              <v-text-field v-model="search" append-icon="mdi-magnify" label="Search"/>
              <v-data-table :loading="loading" single-select :headers="customerHeaders" item-key="customerName" :items="customers" @click:row="onClick" :search="search">
                <template v-slot:item.customerName="{ item }">
                  {{item.customerName && /[^\s]/.test(item.customerName) ? item.customerName : 'Guest Customer'}}
                </template>
                <template v-slot:item.recentOrder="{ item }">
                  {{item.recentOrder ? $moment(item.recentOrder, 'YYYY-MM-DD').format('ll') : null}}
                </template>
                <template v-slot:item.total="{ item }">
                  <Currency :amount="item.total / 100" :currency="item.currency"/>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-col>
      <v-dialog
        v-model="showCustomerDialog"
        max-width="800px"
      >
        <v-card>
          <v-toolbar color="secondary" class="mb-2" dark>
            <v-toolbar-title>{{customerName && /[^\s]/.test(customerName) ? customerName : 'Guest Customer'}} {{customerEmail ? `- ${customerEmail}` : '' }}</v-toolbar-title>
            <v-spacer/>
            <v-btn @click="showCustomerDialog = false" icon><v-icon>close</v-icon></v-btn>
          </v-toolbar>
          <v-tabs
            v-model="currentTab"
            fixed-tabs
            slider-color="primary"
          >
            <v-tab key="orders">
              Orders
            </v-tab>
            <v-tab key="items">
              Items
            </v-tab>
          </v-tabs>
          <v-card-text class="px-2 mt-5">
            <v-tabs-items v-model="currentTab">
              <v-tab-item key="orders">
                <v-data-table class="order-table-row" @click:row="(item, slot) => slot.expand(!slot.isExpanded)" single-expand :expanded.sync="expanded" show-expand item-key="key" :headers="orderHeaders" no-data-text="Please Select A Customer" :items="orders">
                  <template v-slot:item.date="{ item }">
                    {{item.date ? $moment(item.date, 'YYYY-MM-DD').format('ll') : null}}
                  </template>
                  <template v-slot:item.itemPrice="{ item }">
                    <Currency :amount="item.lineItems.map(el => el.itemPrice).reduce((a, b) => a + b, 0)" :currency="item.currency"/>
                  </template>
                  <template v-slot:expanded-item="{ headers, item }">
                    <td :colspan="headers.length">
                      <v-row justify="space-between" v-for="(li, i) in item.lineItems" :key="item.integrationOid + li.id + i">
                        <v-col>
                          {{ li.name }}
                        </v-col>
                        <v-col cols="3">
                          <Currency :amount="li.itemPrice" :currency="item.currency"/>
                        </v-col>
                      </v-row>
                    </td>
                  </template>
                </v-data-table>
              </v-tab-item>
              <v-tab-item key="items">
                <v-data-table item-key="productName" :headers="customerItemHeaders" no-data-text="Please Select A Customer" :items="customerItems">
                  <template v-slot:item.mostRecentOrder="{ item }">
                    {{item.mostRecentOrder ? $moment(item.mostRecentOrder, 'YYYY-MM-DD').format('ll') : null}}
                  </template>
                  <template v-slot:item.totalSpent="{ item }">
                    <Currency :amount="item.totalSpent" :currency="item.currency"/>
                  </template>
                </v-data-table>
              </v-tab-item>
            </v-tabs-items>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>

<script>
import Currency from '@/components/Currency.vue'
import { groupBy, get, flattenDeep, sortBy } from 'lodash'
export default {
  components: {
    Currency
  },
  props: {
    orderData: Array,
    loading: Boolean
  },
  data() {
    return {
      showCustomerDialog: false,
      currentTab: null,
      expanded: [],
      customerHeaders: [
        {
          text: 'Name',
          value: 'customerName'
        },
        {
          text: 'Email',
          value: 'email'
        },
        {
          text: 'Number of Orders',
          value: 'orderCount'
        },
        {
          text: 'Most recent order date',
          value: 'recentOrder'
        },
        {
          text: 'Total Spent',
          value: 'total'
        }
      ],
      orderHeaders: [
        {
          text: 'Order Id',
          value: 'integrationOid'
        },
        {
          text: 'Date',
          value: 'date'
        },
        {
          text: 'Price',
          value: 'itemPrice'
        }
      ],
      customerItemHeaders: [
        {
          text: 'Product',
          value: 'productName'
        },
        {
          text: 'Last Purchase',
          value: 'mostRecentOrder'
        },
        {
          text: 'Total Count',
          value: 'count'
        },
        {
          text: 'Total Spent',
          value: 'totalSpent'
        }
      ],
      customerName: '',
      customerEmail: '',
      search: ''
    }
  },
  methods: {
    onClick(item, row) {
      row.select(true)
      this.customerName = item.customerName
      this.customerEmail = item.email
      this.showCustomerDialog = true
    },
    handleRecentOrderClick() {
      if (!this.mostRecentOrder) {
        console.warn('mostRecentOrder not found!')
        return
      }
      const { customerName, email } = this.mostRecentOrder
      this.customerName = customerName
      this.customerEmail = email
      this.showCustomerDialog = true
    },
    isSelected(item) {
      if (item.customerName === this.customerName) {
        return 'selected'
      }
      return ''
    }
  },
  computed: {
    customers() {
      if (!this.orderData) {
        return
      }
      const uniqueCustomers = new Set(this.orderData.map(item => {
        const displayName = get(item, 'customer.displayName')
        return displayName
      }))
      let customerList = []
      uniqueCustomers.forEach(customer => {
        const customerOrders = this.orderData.filter((obj) => get(obj, 'customer.displayName') === customer)
        const orders = groupBy(customerOrders, 'integrationOid')
        const orderCount = Object.keys(orders).length
        const total = customerOrders.reduce((total, c) => {
          return total + c.total
        }, 0)
        const unparsedRecentOrder = customerOrders.find(el => el.checkedOutOn)
        let recentOrder = null
        if (unparsedRecentOrder) {
          recentOrder = unparsedRecentOrder.checkedOutOn
        }
        const currency = get(customerOrders[0], 'currency')
        const email = get(customerOrders[0], 'customer.email')
        customerList.push({
          customerName: customer,
          email,
          orderCount,
          recentOrder,
          total,
          currency
        })
      })
      return customerList
    },
    orders() {
      const { orderData, customerEmail } = this
      if (!orderData) {
        console.warn(`Expected orderData, but receieved ${orderData}`)
        return
      }

      const filteredOrders = orderData.filter(el => {
        const elEmail = get(el, 'customer.email')

        return elEmail === customerEmail
      })
      const mappedOrders = filteredOrders.map(el => {
        return {
          date: el.checkedOutOn,
          key: el.id,
          integrationOid: el.integrationOid,
          lineItems: el.lines
        }
      })
      return mappedOrders
    },
    customerItems() {
      if (!this.orders) {
        return
      }
      let orderItems = []
      this.orders.forEach(order => {
        const { lineItems, currency, date } = order
        lineItems.forEach(li => {
          const currentIndex = orderItems.findIndex(el => el.productName === li.name)
          if (currentIndex === -1) {
            orderItems.push({ productName: li.name, currency, lineItems: [li], count: 1, totalSpent: li.itemPrice, mostRecentOrder: date })
          } else {
            orderItems[currentIndex].lineItems.push(li)
            orderItems[currentIndex].count++
            orderItems[currentIndex].totalSpent += li.itemPrice
            orderItems[currentIndex].mostRecentOrder = (Date(date) > Date(orderItems[currentIndex].mostRecentOrder) ? date : orderItems[currentIndex].mostRecentOrder)
          }
        })
      })
      return orderItems
    },
    mostRecentOrder() {
      if (!this.customers) {
        return
      }
      const recentOrdersMap = this.customers.map(el => {
        const { customerName, email, recentOrder } = el
        return {
          customerName,
          recentOrder,
          email
        }
      }).filter(el => el.recentOrder).sort((a, b) => new Date(b.recentOrder) - new Date(a.recentOrder))
      return recentOrdersMap[0]
    },
    mostOrderedItem() {
      if (!this.orderData) {
        return
      }
      const { orderData } = this
      const mappedLineItems = orderData.map(el => el.lines)
      const flattenedLineItems = flattenDeep(mappedLineItems)
      const groupedLineItems = groupBy(flattenedLineItems, 'name')
      delete groupedLineItems['Everra Influencer Registration - Influencer']
      const sortedProducts = sortBy(groupedLineItems, el => el.length)
      return sortedProducts[0]
    }
  }
}
</script>

<style>
  .customer-list tr {
    cursor: pointer !important;
  }
  .order-table-row {
    cursor: pointer !important;
  }
  .title-bar-card {
    word-break: break-word;
  }
</style>
