<template>
  <div>
    <v-toolbar>
      <v-btn v-if="path.length > 0" icon class="hidden-xs-only" @click="goBack">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title> Root Folder / {{path.join(' / ')}}</v-toolbar-title>
    </v-toolbar>
     <v-subheader v-if="folder.folders.length > 0">Folders</v-subheader>
    <div id="files" class="d-flex flex-wrap justify-start align-content-start">
      <v-card v-for="name in folder.folders" :key="name" class="ma-4">
        <v-list-item @click="enterFolder(name)">
          <v-list-item-icon><v-icon>folder</v-icon></v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title class="headline text-capitalize">{{name}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-card>
    </div>
    <v-subheader v-if="folder.assets.length > 0">Files</v-subheader>
    <div id="files" class="d-flex flex-wrap justify-start align-content-start">
      <v-card v-for="file in folder.assets" :key="file.id" class="ma-4" style="max-width: 300px;">
        <template v-if="file.categoryKey === 'doc'">
          <pdf :src="file.url" :page="1" style="max-width: 300px; min-height: 200px;">
            <template slot="loading">
              <p class="text-center">Loading PDF Preview</p>
            </template>
          </pdf>
        </template>
        <template v-else-if="file.categoryKey === 'image'">
          <v-img :src="file.url" aspect-ratio="2.75"></v-img>
        </template>
        <template v-else>
          <v-img :src="file.thumbnailUrl" aspect-ratio="2.75"></v-img>
        </template>
        <v-divider/>
        <v-divider/>
        <p class="text-center headline" style="width: 300px;">{{ file.name.split('/').pop() }}</p>
        <p class="text-center subtitle-1" style="width: 300px;">{{ file.description }}</p>
        <div>
          <v-btn text color="primary" @click="navigateToAsset(file)">View</v-btn>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script>
import { searchAssetsByKey } from '@/modules/content/service.js'
import pdf from 'pdfvuer'
import { set, get } from 'lodash'

export default {
  components: {
    pdf
  },
  data() {
    return {
      directory: {},
      path: [],
      current: []
    }
  },
  mounted() {
    this.getFiles()
  },
  methods: {
    enterFolder(name) {
      this.current = this.current[name]
      this.path.push(name)
    },
    goBack() {
      this.path.pop()
      if (this.path.length > 0) {
        this.current = get(this.directory, this.path)
      } else {
        this.current = this.directory
      }
    },
    async getFiles() {
      const input = {
        tenantId: this.$tenantId,
        anyTags: this.$tenantInfo.features.assetTags.files,
        visibilityIds: [200, 201, 202, 203, 204],
        includeThumbnails: false,
        includeSources: false,
        page: 1,
        pageSize: 25
      }

      const result = await searchAssetsByKey('BetterAssetSearch', input)
      result.results.forEach(a => {
        set(this.directory, a.name.split('/'), a)
      })
      this.current = this.directory
    },
    navigateToAsset(item) {
      window.open(item.url, '_blank')
    }
  },
  computed: {
    folder() {
      const folders = []
      const assets = []
      Object.entries(this.current).forEach(([key, value]) => {
        if (!value.id) {
          folders.push(key)
        } else {
          assets.push(value)
        }
      })
      return { folders, assets }
    }
  }
}
</script>
