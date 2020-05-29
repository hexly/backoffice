<template>
  <v-data-table
    :headers="headers"
    :items="newsletterList"
    @click:row="navigateToAsset">
  </v-data-table>
</template>

<script>
import { searchAssetsByKey } from '@/modules/content/service.js'
export default {
  data() {
    return {
      newsletterList: [],
      headers: [
        {
          text: 'ID',
          value: 'id',
          sortable: false
        },
        {
          text: 'Newsletter',
          value: 'name',
          sortable: false
        },
        {
          text: 'Description',
          value: 'description',
          sortable: false
        }
      ]
    }
  },
  mounted() {
    this.getNewsletters()
  },
  methods: {
    async getNewsletters() {
      const input = {
        tenantId: this.$tenantId,
        anyTags: ['search:newsletter'],
        visibilityIds: [200, 201, 202, 203, 204],
        includeThumbnails: false,
        includeSources: false,
        page: 1,
        pageSize: 25
      }

      const result = await searchAssetsByKey('BetterAssetSearch', input)
      this.newsletterList = result.results
    },
    navigateToAsset(item) {
      window.open(item.url, '_blank')
    }
  }
}
</script>
