<template>
    <div id="newsletters" class="pa-4">
      <v-card v-for="newsletter in newsletterList" :key="newsletter.id" class="d-inline-block mx-auto mr-4" style="max-width: 300px;">
          <pdf :src="newsletter.url" :page="1" style="max-width: 300px; min-height: 200px;">
            <template slot="loading">
              <p class="text-center">Loading PDF Preview</p>
            </template>
          </pdf>
        <v-divider/>
        <v-divider/>
        <p class="text-center headline" style="width: 300px;">{{ newsletter.name }}</p>
        <p class="text-center subtitle-1" style="width: 300px;">{{ newsletter.description }}</p>
        <div>
          <v-btn text color="primary" @click="navigateToAsset(newsletter)">View</v-btn>
        </div>
      </v-card>
    </div>
</template>

<script>
import { searchAssetsByKey } from '@/modules/content/service.js'
import pdf from 'pdfvuer'

export default {
  components: {
    pdf
  },
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
        anyTags: this.$tenantInfo.features.assetTags.newsletter,
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
