<template>
  <div class="graph-view">
    <v-layout row justify-space-between>
      <v-flex xs2>
        <v-select
          v-model="select"
          :items="graphOptions"
          item-text="option"
          label="Graph Type"
          return-object
        ></v-select>
      </v-flex>
    </v-layout>
    <div ref="graph"></div>
    <v-data-table :headers="tableColumns" :items="items" item-key="id" class="elevation-1 mb-10" :expanded="expanded" show-expand :loading="loading">
      <template v-slot:item="{ item, isExpanded }">
        <tr>
          <td>{{ item.checkedOutOn ? moment(item.date, 'YYYY-MM-DD').format('LL') : null }}</td>
          <td><Currency :amount="parseFloat(item.total / 100)" :currency="item.currency"/></td>
          <td>{{ item.totalPoints }}</td>
          <td>{{ item.displayName }}</td>
          <td>{{ item.sellerEmail }}</td>
          <td>
            <v-icon @click="expanded = []" v-if="isExpanded">expand_less</v-icon>
            <v-icon  @click="expanded = [item]" v-else>expand_more</v-icon>
          </td>
        </tr>
      </template>
      <template v-slot:expanded-item="{ item, headers }">
        <td :colspan="headers.length" class="pa-3 sale-details">
          <v-container fluid>
            <v-layout>
              <v-flex xs4>
                <h4>Details:</h4>
                <ul>
                  <li>Order ID: {{item.id}}</li>
                  <li>Status: {{item.statusOid}}</li>
                  <!-- <li>Customer Note: {{item.customerNote}}</li> -->
                </ul>
              </v-flex>
            </v-layout>
            <v-layout>
              <v-flex xs12>
                <h4>Line Items</h4>
                <ul>
                  <li v-for="line in item.lines" :key="line.id" >{{line.name}} (<Currency :amount="line.itemPrice * line.quantity" :currency="item.currency"/>)</li>
                </ul>
              </v-flex>
            </v-layout>
          </v-container>
        </td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import _ from 'lodash'
import Currency from '@/components/Currency.vue'
import { initialize, updateHeightDepth, collapse,
  checkParentOfPinned } from './Graph.d3.js'
import { SEARCH_SALES_SELLER_ID } from '@/graphql/Sales.gql'
import { FRONTLINE_STATS } from '@/graphql/comp.gql'
import moment from 'moment'
import * as d3 from 'd3'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'TeamGraph',
  data () {
    return {
      moment,
      expanded: [],
      searchTerm: '',
      graph: null,
      root: null,
      radialRoot: null,
      graphOptions: [
        { option: 'Horizontal Tree' },
        { option: 'Vertical Tree' },
        { option: 'Radial Tree' }
      ],
      select: { option: 'Vertical Tree' },
      graphType: 'VT',
      month: moment()
        .format('MM'),
      year: moment().format('YYYY'),
      startDate: moment().startOf('month').format('YYYY-MM-DD'),
      endDate: moment().endOf('month').format('YYYY-MM-DD'),
      tableColumns: [
        { text: 'Date', value: 'date' },
        { text: 'Sale Total', value: 'total' },
        { text: 'Total Points', value: 'points' },
        { text: 'Seller Name', value: 'displayName' },
        { text: 'Seller Email', value: 'contactEmail' },
        { text: '', value: 'data-table-expand' }
      ],
      contextMenuOptions: {
        unPinMenu: {
          title: `UnPin Member`,
          action: this.pinMember
        },
        pinMenu: {
          title: `Pin Member`,
          action: this.pinMember
        },
        displaySales: {
          title: `Display Sales`,
          action: this.updateSales
        },
        collapseMenu: {
          title: `Collapse Team`,
          action: this.collapseTeam
        },
        expandMenu: {
          title: `Expand Team`,
          action: this.expandTeam
        },
        loadChildrenMenu: {
          title: `Load Team`,
          action: this.loadChildrenMenu
        },
        center: {
          title: `Center`,
          action: this.centerMember
        }
      },
      zoomControls: [
        {
          control: 'zoomIn',
          img: '/img/icons/zoomIn.png',
          action: this.zoom,
          data: { amount: 1.02 }
        },
        {
          control: 'zoomOut',
          img: '/img/icons/zoomOut.png',
          action: this.zoom,
          data: { amount: 0.98 }
        }],
      panControls: [
        {
          control: 'panLeft',
          img: '/img/icons/leftArrow.png',
          action: this.pan,
          translate: { x: -1, y: 0 },
          data: { x: 10, y: 0 }
        },
        {
          control: 'panUp',
          img: '/img/icons/upArrow.png',
          action: this.pan,
          translate: { x: 0, y: -1 },
          data: { x: 0, y: 10 }
        },
        {
          control: 'panDown',
          img: '/img/icons/downArrow.png',
          action: this.pan,
          translate: { x: 0, y: 1 },
          data: { x: 0, y: -10 }
        },
        {
          control: 'panRight',
          img: '/img/icons/rightArrow.png',
          action: this.pan,
          translate: { x: 1, y: 0 },
          data: { x: -10, y: 0 }
        }
      ],
      sales: [],
      pinned: null,
      fetchedData: {},
      memberDict: {},
      firstPin: true,
      memberId: null,
      sellerId: null,
      loading: false,
      cfg: null
    }
  },
  watch: {
    select (newSelection) {
      this.changeGraphType(newSelection)
    },
    async period(newVal, oldVal) {
      this.fetchedData = await this.fetchData({ member: this.member })
      this.graph = initialize(this.cfg, this.fetchedData)
      this.pin(this.root)
      this.loading = false
    }
  },
  components: {
    Currency
  },
  async mounted () {
    this.cfg = {
      el: this.$refs.graph,
      clickNode: this.clickNode,
      root: this.root,
      contextMenuFunc: this.contextMenuFunc,
      ranks: this.ranks,
      getRoot: this.getRoot,
      setRoot: this.setRoot,
      getSearchTerm: this.getSearchTerm,
      getLoading: this.getLoading,
      zoomControls: this.zoomControls,
      panControls: this.panControls,
      getGraphType: this.getGraphType,
      setRadialRoot: this.setRadialRoot,
      getRadialRoot: this.getRadialRoot
    }
    this.loading = true
    this.memberId = this.member.id
    this.sellerId = this.memberId
    if (this.period.id) {
      this.fetchedData = await this.fetchData({ member: this.member })
      this.graph = initialize(this.cfg, this.fetchedData)
      this.pin(this.root)
      this.loading = false
    }
  },
  methods: {
    expand(row) {
      if (this.expanded.length > 0) {
        this.expanded = []
      } else {
        this.expanded = [row]
      }
    },
    zoom ({ amount }) {
      this.graph.zoomInAndOut({ amount })
    },
    pan ({ x, y }) {
      this.graph.panAround({ x, y })
    },
    search () {
      this.updateGraph({ source: this.root })
    },
    dateChanged ({ date }) {
      this.startDate = moment(date).startOf('month').format('YYYY-MM-DD')
      this.endDate = moment(date).endOf('month').format('YYYY-MM-DD')
      this.refreshGraph()
    },
    changeGraphType ({ option }) {
      switch (option) {
      case 'Horizontal Tree':
        if (this.graphType !== 'HT') { this.graphType = 'HT' } else return
        break
      case 'Vertical Tree':
        if (this.graphType !== 'VT') { this.graphType = 'VT' } else return
        break
      case 'Radial Tree':
        if (this.graphType !== 'RT') { this.graphType = 'RT' } else return
        break
      }
      this.searchTerm = ''
      this.graph.changeGraphType(this.root, this.graphType)
      this.updateGraph({ center: true, updateHeight: true })
    },
    getGraphType () {
      return this.graphType
    },
    getRoot () {
      return this.root
    },
    setRoot (newRoot) {
      this.root = newRoot
    },
    getRadialRoot () {
      return this.radialRoot
    },
    setRadialRoot (newRoot) {
      this.radialRoot = newRoot
    },
    getSearchTerm () {
      return this.searchTerm === '' ? null : this.searchTerm.toLowerCase()
    },
    getLoading () {
      return this.loading
    },
    reloadGraph () {
      this.graph.loadGraph({ fetchedData: this.fetchedData, graphType: this.graphType })
      this.pin(this.root)
      this.centerMember(this.root, this.graphType)
    },
    updateGraph (updateOptions) {
      const updateInput = {
        source: this.root,
        pinned: this.pinned,
        firstPin: this.firstPin,
        graphType: this.graphType,
        ...updateOptions
      }
      this.graph.update(updateInput)
    },
    zoomOut () {
      this.graph.zoomInAndOut({ amount: 0.8 })
    },
    pin (node) {
      // To be implemented in the future

      // if (this.pinned !== node) {
      //         this.pinned = node
      //         this.updateSellerId(this.pinned.data.data.memberId)
      //       } else {
      //         this.firstPin = true
      //         this.pinned = null
      //         this.updateSellerId(null)
      //       }
      //       this.graph.updatePinned(this.pinned, this.firstPin)
      //       this.firstPin = !this.pinned

      this.pinned = null
    },
    clickNode (selected) {
      if (selected._children) {
        selected.children = selected._children
        selected._children = null
        if (this.graphType === 'RT') {
          this.radialRoot = selected
        }
        this.updateGraph({ source: selected, center: true, updateHeight: true })
      } else if (!checkParentOfPinned(selected, this.pinned)) {
        if (selected.children || (this.graphType === 'RT' && selected.data.id === this.radialRoot.data.id)) {
          selected._children = selected.children
          selected.children = null
          if (this.graphType === 'RT' && selected.parent) {
            this.radialRoot = selected.parent
            this.updateGraph({ source: selected.parent, center: true, updateHeight: true })
          } else { this.updateGraph({ source: selected, center: true, updateHeight: true }) }
        } else {
          this.loadChildrenMenu(selected)
        }
      }
      // this.updateGraph({ source: selected, center: true, updateHeight: true })
    },
    centerMember (d) {
      this.graph.centerMember(d, this.graphType)
    },
    updateSales (d) {
      this.updateSellerId(d ? d.data.data.memberId : null)
    },
    updateSellerId (newId) {
      this.sellerId = newId
    },
    contextMenuFunc (data) {
      const menu = []
      menu.push(this.contextMenuOptions[`displaySales`])
      menu.push(this.contextMenuOptions[`center`])

      if (data.children) menu.push(this.contextMenuOptions[`collapseMenu`])
      else if (data._children) {
        menu.push(this.contextMenuOptions[`expandMenu`])
      } else if (data.data.data.frontLineSize > 0) {
        menu.push(this.contextMenuOptions[`loadChildrenMenu`])
      }

      return menu
    },
    pinMember (d) {
      this.pin(d)
    },
    collapseTeam (d) {
      if (d.children) {
        d._children = d.children
        d.children = null
      }
      this.updateGraph({ source: d, center: true })
    },
    expandTeam (d) {
      if (d._children) {
        d.children = d._children
        d._children = null
      }
      this.updateGraph({ source: d, center: true })
    },
    async loadChildrenMenu (d, i) {
      if (d.data.data.frontLineSize > 0 && !d.children && !d._children) {
        this.loading = true
        let newChild = await this.fetchData({ member: d.data.data })
        let newNode = d3.hierarchy(newChild, d => d.children)
        if (newNode.children) {
          newNode.children.forEach(child => { child.parent = d })

          d.children = [...newNode.children]
          d.data.children = [...newNode.data.children]

          updateHeightDepth(this.root, 0)

          d.children.forEach(collapse)
        } else { d.data.data.leaf = true }
        this.loading = false
      } else {
        d.data.data.leaf = true
      }
      if (this.graphType === 'RT') {
        this.radialRoot = d
      }

      this.updateGraph({ source: d, center: true, updateHeight: true })
    },
    async refreshGraph () {
      this.loading = true
      let memberIds = Object.keys(this.memberDict).map(Number)
      const { data: { engine: { frontlineStats } } } = await this.$apollo.query({
        query: FRONTLINE_STATS,
        variables: {
          input: {
            sponsorIds: memberIds,
            periodId: this.period.id
          }
        },
        client: 'federated'
      })
      frontlineStats.forEach(stat => {
        this.memberDict[stat.memberId] = {
          id: stat.memberId,
          memberId: stat.memberId,
          sponsorId: stat.sponsorId,
          displayName: stat.member.displayName,
          profileUrl: _.get(stat, 'member.avatar.assetUrl'),
          teamSize: stat.teamSize,
          frontLineSize: stat.frontlineSize,
          totalPoints: stat.stats.totalPoints || 0,
          totalAmount: stat.stats.totalAmount || 0
          // _data: member// As far as I know we don't need this
        }
      })
      this.refreshNode({ node: this.root, dataChild: false })
      this.updateGraph({ source: this.root, center: false })
      this.loading = false
    },
    refreshNode ({ node, dataChild }) {
      if (dataChild) {
        node.data = this.memberDict[node.id]
        return
      }
      node.data.data = this.memberDict[node.data.id]
      if (node.children) {
        node.children.forEach(child => {
          this.refreshNode({ node: child })
        })
      }
      if (node.data.children) {
        node.data.children.forEach(child => {
          this.refreshNode({ node: child, dataChild: true })
        })
      }
      if (node._children) {
        node._children.forEach(child => {
          this.refreshNode({ node: child })
        })
      }
    },
    async fetchData ({ member }) {
      const { data: { engine: { frontlineStats } } } = await this.$apollo.query({
        query: FRONTLINE_STATS,
        variables: {
          input: {
            sponsorIds: [member.id],
            periodId: this.period.id
          }
        },
        client: 'federated'
      })
      if (frontlineStats) {
        const tempArr = [{
          memberId: member.id,
          displayName: member.displayName,
          profileUrl: member.profileUrl
        }]
        frontlineStats.forEach(stat => {
          this.memberDict[stat.memberId] = {
            id: stat.memberId,
            memberId: stat.memberId,
            sponsorId: stat.sponsorId,
            displayName: _.get(stat, 'member.displayName', ''),
            profileUrl: _.get(stat, 'member.avatar.assetUrl'),
            teamSize: stat.teamSize,
            frontLineSize: stat.frontlineSize,
            totalPoints: stat.stats.totalPoints || 0,
            totalAmount: stat.stats.totalAmount || 0
            // _data: member// As far as I know we don't need this
          }
          tempArr.push({
            id: stat.memberId,
            memberId: stat.memberId,
            sponsorId: stat.memberId === member.id ? null : stat.sponsorId,
            displayName: _.get(stat, 'member.displayName', ''),
            profileUrl: _.get(stat, 'member.avatar.assetUrl'),
            teamSize: stat.teamSize,
            frontLineSize: stat.frontlineSize,
            totalPoints: stat.stats.totalPoints || 0,
            totalAmount: stat.stats.totalAmount || 0
            // _data: member// As far as I know we don't need this
          })
        })

        let stratifiedObj = {}
        // Create a tree like structure from our data
        stratifiedObj = await d3.stratify()
          .id(d => d.memberId)
          .parentId(d => d.sponsorId)(tempArr)

        const { children } = stratifiedObj
        if (!children) return stratifiedObj

        // Alphabetically sort the teamMembers
        children.sort((a, b) => (a.data.displayName.toLowerCase() > b.data.displayName.toLowerCase()) ? 1 : ((b.data.displayName.toLowerCase() > a.data.displayName.toLowerCase()) ? -1 : 0))

        return stratifiedObj
      }
      return null
    }
  },
  computed: {
    ...mapState({
      period: state => state.comp.currentPeriod
    }),
    ...mapGetters(['member']),
    items () {
      return (this.sales || [])
        .map(sale => {
          return {
            ...sale,
            id: sale.id,
            date: sale.checkedOutOn,
            totalPoints: _.get(sale, 'compStats.HexlyTotalPoints'),
            displayName: _.get(sale, 'customer.displayName'),
            sellerEmail: _.get(sale, 'customerEmail')
          }
        })
    },
    currentId: {
      get: function () {
        const id = this.$route.params.id
        return parseInt(id)
      },
      set: function () {
      }
    }
  },
  apollo: {
    sales: {
      query: SEARCH_SALES_SELLER_ID,
      client: 'federated',
      variables () {
        const { memberId } = this

        return {
          input: {
            memberIn: [memberId]
          }
        }
      },
      error (err) {
        this.loading = false
        console.error('SEARCH_SALES_SELLER_ID failed!', { err })
      },
      debounce: 500,
      update (data) {
        const purchaseSearchOrders = _.get(data, 'purchasing.purchaseSearchOrders')
        this.loading = false
        return purchaseSearchOrders
      },
      skip() {
        return !this.memberId
      }
    }
  }
}
</script>

<style>
.graph-view {
 padding: 15px;
}

.imgCircle {
  fill: #fafafa;
  stroke: #828282;
  stroke-width: 3px;
}
.rankCircle {
  fill: #fff;
  stroke: #828282;
  stroke-width: 2px;
}

.controlCircle {
  fill: black;
  opacity: 0.2;
}
.parentCircle {
  fill: #fafafa;
  stroke: #ccc;
  stroke-width: 2px;
}
.memberHighlight {
  fill: #feff00;
}

.node text {
  font: 12px sans-serif;
}

.infoRect {
  fill: #fafafa;
  stroke: #ccc;
}

.link {
  fill: none;
  stroke: #ccc;
  stroke-width: 2px;
}
.graph-view svg {
  border: 2px solid #ccc;
}

.pinImage {
  height: 42px;
  width: 42px;
  position: fixed;
}

.d3-context-menu {
  position: absolute;
  display: none;
  background-color: #f2f2f2;
  border-radius: 4px;

  font-family: Arial, sans-serif;
  font-size: 14px;
  min-width: 150px;
  border: 1px solid #d4d4d4;

  z-index: 1200;
}

.d3-context-menu ul {
  list-style-type: none;
  margin: 4px 0px;
  padding: 0px;
  cursor: default;
}

.d3-context-menu ul li {
  padding: 4px 16px;
}

.d3-context-menu ul li:hover {
  background-color: #4677f8;
  color: #fefefe;
}
</style>
