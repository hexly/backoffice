<template>
  <div class="my-link">
    <div v-if="slug">
      <v-text-field
        solo
        color="black"
        :value="formattedSlug"
        readonly
        single-line
        class="link">
        <v-tooltip slot="append" bottom>
            <template v-slot:activator="{ on }">
              <v-icon v-if="canShare" @click="shareLink" v-on="on" color="black" dark>share</v-icon>
              <v-icon v-else @click="copyToClipboard" v-on="on" color="black" dark>assignment</v-icon>
            </template>
            <span v-if="canShare">{{shareTooltipText}}</span>
            <span v-else>{{copyTooltipText}}</span>
        </v-tooltip>
      </v-text-field>
    </div>
    <div v-else>
      <v-alert :value="true" type="warning">
        Hey There! You do not have your link set up yet.
        <br />
        Note: You will not be able to change it once it is set.
      </v-alert>
      <v-text-field
        ref="slugField"
        :loading="checkingSlug"
        placeholder="my-personal-link"
        class="slug-field edit-link"
        v-model="generateSlug"
        @keyup="slugChanged"
        :rules="slugRule"
        :error-messages="slugErrors"
        outline
        :label="$tenantInfo.storeUrl.replace('{slug}', '')"
      ></v-text-field>
      <v-btn :loading="savingSlug" @click="saveSlug" :disabled="!slugUnique || !generateSlug || !$refs.slugField.valid" color="green">Create Link</v-btn>
    </div>
  </div>
</template>

<script>
import { debounce } from 'lodash'
import { mapMutations, mapGetters } from 'vuex'
import Rules from '@/views/Rules.js'
import { CHECK_IF_UNIQUE_SLUG, ADD_MEMBER_SLUG } from '@/graphql/Slug'
import { UserMutations } from '@/stores/UserStore'
import { setTimeout } from 'timers'

export default {
  name: 'MyLink',
  data() {
    return {
      tempSlug: '',
      slugUnique: true,
      checkingSlug: false,
      slugErrors: [],
      slugRule: Rules.slugRule,
      checkSlug: null,
      copyTooltipText: 'Copy',
      shareTooltipText: 'Share',
      savingSlug: false
    }
  },
  methods: {
    shareLink() {
      navigator.share({ url: this.formattedSlug })
        .then(() => {
          this.copyTooltipText = 'Shared'
          setTimeout(() => {
            this.copyTooltipText = 'Share'
          }, 3000)
        })
        .catch((error) => console.log('Error sharing', error))
    },
    async copyToClipboard() {
      await this.$copyText(this.formattedSlug)
      this.copyTooltipText = 'Copied!'
      setTimeout(() => {
        this.copyTooltipText = 'Copy'
      }, 3000)
    },
    slugChanged: debounce(async function(searchTerm) {
      this.slugUnique = false
      this.slugErrors = []
      this.checkingSlug = true
      const { data } = await this.$apollo.query({
        query: CHECK_IF_UNIQUE_SLUG,
        variables: {
          input: {
            tenantId: this.$tenantId,
            slug: this.generateSlug
          }
        },
        fetchPolicy: 'network-only'
      })
      const { checkSlug } = data
      if (!checkSlug && this.generateSlug) {
        this.slugUnique = true
      } else if (checkSlug) {
        this.slugErrors = ['Your link needs to be unique']
      }
      this.checkSlug = checkSlug
      this.checkingSlug = false
    }, 500),
    async saveSlug() {
      if (this.generateSlug) {
        this.savingSlug = true
        await this.$apollo.mutate({
          mutation: ADD_MEMBER_SLUG,
          variables: {
            input: {
              tenantId: this.$tenantId,
              slug: this.generateSlug
            }
          }
        })
        this.setSlug(this.generateSlug)
        this.savingSlug = false
      }
    },
    ...mapMutations({
      setSlug: UserMutations.SET_SLUG
    })
  },
  computed: {
    canShare() {
      return navigator.share
    },
    ...mapGetters(['slug', 'member']),
    formattedSlug() {
      return this.$tenantInfo.storeUrl.replace('{slug}', this.slug || this.generateSlug)
    },
    generateSlug: {
      get() {
        return this.tempSlug
      },
      set(val) {
        this.tempSlug = val.toLowerCase()
      }
    }
  }
}
</script>

<style>
.my-link .edit-link {
  font-size: 14px;
}
.my-link .link {
  font-size: 3vw;
}
@media screen and (min-width: 800px) {
  .my-link .link {
  font-size: 14px;
}
}
@media screen and (min-width: 1200px) {
  div {
    font-size: 14px;
  }
}

</style>
