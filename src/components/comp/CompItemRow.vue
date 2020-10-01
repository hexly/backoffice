<template>
  <tr class="item-row">
    <td v-for="(header) in headers" :key="header.value" :class="`col-${header.value}`">
      <template v-if="header.value == 'actions'">
        <v-icon @click="$emit('close')" v-if="expanded">expand_less</v-icon>
        <v-icon  @click="$emit('expand')" v-else>expand_more</v-icon>
      </template>
      <template v-if="header.value == 'awardeeId'">
        {{ _.get(memberRow, `_level.${header.value}.totalPoints`, _.get(memberRow, `_level.${header.value}`)) }}{{ rank.name }}
      </template>
      <template v-if="header.value == 'details'">
        {{ rank.name }}
      </template>
      <template v-else-if="memberRow">
        {{ _.get(memberRow, `_level.${header.value}.totalPoints`, _.get(memberRow, `_level.${header.value}`)) }}
      </template>
    </td>
  </tr>
</template>

<script>
export default {
  props: {
    headers: Array,
    item: Object,
    members: Array,
    expanded: Boolean,
    expand: Function
  },
  watch: {
    item(item) {
      this.syncItem(item)
    }
  },
  mounted(props) {
    this.syncItem(this.item)
  },
  methods: {
    syncItem(item) {
      if (item && (!this.memberRow || this.memberRow.awardeeId !== item.awardeeId)) {
        this.memberRow = this.members.find(r => r.awardeeId === item.awardeeId)
      }
    }
  },
  data() {
    return {
      memberRow: null
    }
  },
  computed: {
    rank() {
      return this._.get(this, 'item.metadata.ranking', {
        rank: -1,
        name: 'Not Available'
      })
    },
    upline() {
      return this._.chain(this)
        .get('item.metadata.upline')
        // .map()
        .value()
    }
  }
}
</script>

<style scoped>
.item-row >>> .col-actions {
  text-align: right
}
</style>
