<template>
  <v-container>
    <v-btn v-if="label" @click="canShow = true" :disabled="canUpload" class="primary text-capitalize" large>
      {{ label }}
    </v-btn>
    <v-dialog
      max-width="600px"
      :fullscreen="$vuetify.breakpoint.xs"
      v-model="showDialog"
    >
      <v-card>
        <v-card-title class="application-title">
          <h3>Select a Image to Upload.</h3>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-alert v-if="error" type="error" :value="error">{{error}}</v-alert>
          <file-pond
            name="libaryUpload"
            ref="pond"
            class-name="my-pond"
            label-idle="Drop file here or click to browse files"
            :allow-multiple="false"
            :instantUpload="false"
            :allow-revert="false"
            :accepted-file-types="acceptedTypes"
            :files="files"
            :allowImageResize="true"
            :imageResizeUpscale="false"
            :imageResizeTargetWidth="800"
            :imageResizeTargetHeight="800"
            :imageTransformOutputQuality="75"
            :imageCropAspectRatio="1"
            :beforeAddFile="beforeAddFile"
            @addfile="onaddfile"
            @removefile="onremovefile"
            @error="onError"
          />
          <div>
            <v-layout row xs12>
              <v-card-actions>
                <v-btn v-if="currentFile && !loading" :loading="loading" color="primary" @click="upload">
                  Upload
                </v-btn>
                <v-btn :disabled="loading" color="secondary" @click="done">Cancel</v-btn>
              </v-card-actions>
            </v-layout>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { get } from 'lodash'

import vueFilePond from 'vue-filepond'
import { mapActions, mapGetters } from 'vuex'

import FilePondPluginFilePoster from 'filepond-plugin-file-poster'
import FilePondPluginImageOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.esm.js'
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type/dist/filepond-plugin-file-validate-type.esm.js'
import FilePondPluginImageResize from 'filepond-plugin-image-resize'
import FilePondPluginImageTransform from 'filepond-plugin-image-transform'

// Import styles
import 'filepond/dist/filepond.min.css'
import 'filepond-plugin-file-poster/dist/filepond-plugin-file-poster.css'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css'

import { ContentActions, ContentGetters } from '@/modules/content/store.js'
import { createAsset } from '@/modules/content/service'

// Create FilePond component
const FilePond = vueFilePond(
  FilePondPluginFileValidateType,
  FilePondPluginImagePreview,
  FilePondPluginFilePoster,
  FilePondPluginImageOrientation,
  FilePondPluginImageResize,
  FilePondPluginImageTransform
)

export default {
  name: 'UploadDialog',
  components: { FilePond },
  props: {
    canUpload: Boolean,
    shouldShow: {
      type: Boolean,
      default: false
    },
    label: String,
    isProfilePic: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      acceptedImages: 'image/jpeg, image/png',
      acceptedVideo: 'video/webm, video/mp4, video/mov, video/quicktime',
      canShow: false,
      currentFile: null,
      error: null,
      fileData: {},
      files: [],
      loading: false,
      showTerms: false,
      thumbnail: null,
      uploadDialog: false
    }
  },
  computed: {
    ...mapGetters({ assetMeta: ContentGetters.assetMeta }),
    acceptedTypes() {
      return this.isProfilePic ? this.acceptedImages : this.acceptedImages.concat(this.acceptedVideo)
    },
    showDialog: {
      get() {
        return this.canShow || this.shouldShow
      },
      set(newVal) {
        if (newVal === false) {
          this.$emit('dialogClosed')
        }
        this.canShow = newVal
      }
    }
  },
  watch: {
    canShow(newVal, oldVal) {
      if (newVal) {
        this.refreshMeta()
      }
    },
    shouldShow(newVal, oldVal) {
      if (newVal) {
        this.refreshMeta()
      }
    }
  },
  methods: {
    ...mapActions({ refreshMeta: ContentActions.REFRESH_ASSET_META }),
    filtered(tags, filters) {
      return tags.filter(tag => filters.indexOf(tag.id) > -1)
    },
    async process(fieldName, file, metadata, load, error, progress, abort) {
      const { fileData, assetMeta } = this

      let asset, tn
      try {
        const type = assetMeta.types.find(e => e.mimeType === file.type)
        if (!type) {
          console.warn('Unsupported type', { file, assetMeta })
          return error('Could not determine a supported file type for ' + file.type)
        }

        const [provider] = assetMeta.providers
        if (!provider) {
          console.warn('No known upload provider', { file, assetMeta })
          return error('Could not determine a supported upload destination. Please contact support')
        }

        const payload = {
          typeId: type.id,
          tenantIntegrationId: provider.tenantIntegrationId,
          slug: new Date().getTime().toString(),
          name: fileData.name,
          description: fileData.desc,
          public: true,
          ownerReadable: true
        }

        if (this.thumbnail && file.type.indexOf('video') === -1) {
          payload.thumbnail = {
            typeId: this.thumbnail.type.id,
            tenantIntegrationId: provider.tenantIntegrationId,
            slug: 'thumbnail_' + new Date().getTime().toString(),
            name: 'thumbnail_' + fileData.name,
            description: 'Thumbnail for ' + fileData.name,
            public: true,
            ownerReadable: false
          }
        }

        const categoryKey = file.type.indexOf('video') === -1
          ? 'image'
          : 'video'

        const result = await createAsset(payload)
        asset = { categoryKey, ...get(result, 'destination', {}) }
        tn = get(result, 'thumbnail')
      } catch (e) {
        console.warn('failed meta stuff', e)
        return error('We were unable to associate your upload correctly. Please contact support')
      }

      if (tn && file.type.indexOf('video') === -1) {
        try {
          await this.sendSigned(this.thumbnail.file, tn)
        } catch (err) {
          console.warn('failed uploading thumbnail', err)
        }
      }
      const request = await this.sendSigned(file, asset, progress)

      await this.$emit('uploaded', asset)
      if (this.isProfilePic) {
        await this.$emit('profile', asset)
      }
      if (request.status >= 200 && request.status < 300) {
        load(request.responseText)
        this.done()
      } else {
        const err = new Error('Non 200 upload response returned')
        err.request = request
        error('Did not receive a valid upload response. Please contact support.')
      }

      return {
        abort: () => {
          request.abort()
          abort()
          this.error = 'Upload aborted'
        }
      }
    },
    async beforeAddFile(file) {
      const types = get(this.assetMeta, 'types', [])
      if (file.fileType.indexOf('video') === -1) return true
      this.thumbnail = await this.generateVideoThumbnail(file, types)
      return true
    },
    generateVideoThumbnail(file, types) {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas')
        const video = document.createElement('video')
        video.type = file.type
        video.src = URL.createObjectURL(file.file)
        video.currentTime = 2
        video.onloadeddata = () => {
          const ratio = Math.min(500 / video.videoWidth, 500 / video.videoHeight)
          canvas.height = video.videoHeight * ratio
          canvas.width = video.videoWidth * ratio
          canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth * ratio, video.videoHeight * ratio)
          const thumbnail = canvas.toDataURL('image/png')
          file.setMetadata('poster', thumbnail)
          var blobBin = atob(thumbnail.split(',')[1])
          var array = []
          for (var i = 0; i < blobBin.length; i++) {
            array.push(blobBin.charCodeAt(i))
          }
          resolve({
            type: types.find(e => e.mimeType === 'image/png'),
            file: new Blob([new Uint8Array(array)], { type: 'image/png' })
          })
        }
      })
    },
    async sendSigned(file, asset, progress) {
      const { destination } = asset
      const formData = new FormData()
      Object.keys(destination.fields)
        .map(f => {
          formData.append(f, destination.fields[f])
          return f + ' => ' + destination.fields[f]
        })
        .join('\n')
      formData.append('file', file, file.name)

      const request = new XMLHttpRequest()
      request.open('POST', destination.url)

      if (progress) {
        request.upload.onprogress = (e) => {
          progress(e.lengthComputable, e.loaded, e.total)
        }
      }

      return new Promise((resolve) => {
        request.onload = () => resolve(request)
        request.send(formData)
      })
    },
    async onaddfile(error, file) {
      if (error) {
        this.error = file && file.main && file.sub
          ? `${file.main}: ${file.sub}`
          : error.body
      }
      if (this.currentFile || error) {
        return false
      }
      this.currentFile = file
      this.$set(this, 'fileData', {
        desc: '',
        name: file.filename,
        tags: [],
        type: null
      })
    },
    onError(error, file) {
      this.loading = false
      if (error) {
        this.error = file && file.main && file.sub
          ? `${file.main}: ${file.sub}`
          : error.body
      }
    },
    onremovefile(file) {
      this.error = null
      this.currentFile = null
      this.fileData = null
    },
    async upload() {
      this.loading = true
      this.$refs.pond._pond.setOptions({
        server: { process: this.process }
      })
      this.error = null
      await this.$refs.pond.processFile()
      this.loading = false
    },
    done(reason) {
      this.error = null
      this.currentFile = null
      this.fileData = null
      this.$refs.pond.removeFile()
      this.thumbnail = null
      this.$emit('assetsUploaded')
      this.$emit('dialogClosed')
      this.uploadDialog = false
      this.canShow = false
    }
  }
}
</script>
<style scoped>
ul {
  text-align: left;
}
</style>
