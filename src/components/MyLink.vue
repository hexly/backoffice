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
            <v-icon @click="copyToClipboard" slot="activator" color="black" dark>assignment</v-icon>
            <span>{{copyTooltipText}}</span>
        </v-tooltip>
      </v-text-field>
    </div>
    <div v-else>
      <v-alert
        :value="true"
        type="warning"
      >
        Hey There! You do not have your link set up yet.
        <br />
        Note: You will not be able to change it once it is set.
      </v-alert>
      <v-text-field
        ref="slugField"
        :loading="checkingSlug > 0"
        placeholder="my-personal-link"
        class="mb-3 slug-field edit-link"
        v-model="generateSlug"
        @keyup.native="slugChanged"
        @change="slugChanged"
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
import { mapMutations, mapGetters } from 'vuex'
import Rules from '@/views/Rules.js'
import { CHECK_IF_UNIQUE_SLUG, ADD_MEMBER_SLUG } from '@/graphql/Slug'
import { UserMutations } from '@/stores/UserStore'
import { setTimeout } from 'timers'

const tenantId = ~~process.env.VUE_APP_TENANT_ID

export default {
  name: 'MyLink',
  data() {
    return {
      tempSlug: '',
      slugUnique: true,
      checkingSlug: 0,
      slugErrors: [],
      slugRule: Rules.slugRule,
      checkSlug: null,
      copyTooltipText: 'Copy',
      savingSlug: false
    }
  },
  methods: {
    async copyToClipboard() {
      await this.$copyText(this.formattedSlug)
      this.copyTooltipText = 'Copied!'
      setTimeout(() => {
        this.copyTooltipText = 'Copy'
      }, 3000)
    },
    slugChanged(event) {
      this.slugUnique = false
      this.slugErrors = []
      this.$apollo.queries.checkSlug.refresh()
    },
    async saveSlug() {
      if (this.generateSlug) {
        this.savingSlug = true
        await this.$apollo.mutate({
          mutation: ADD_MEMBER_SLUG,
          variables: {
            input: {
              tenantId,
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
  },
  apollo: {
    checkSlug: {
      query: CHECK_IF_UNIQUE_SLUG,
      variables() {
        return {
          input: {
            tenantId,
            slug: this.generateSlug
          }
        }
      },
      fetchPolicy: 'network-only',
      loadingKey: 'checkingSlug',
      skip() {
        return !(!this.slug && this.generateSlug)
      },
      update({ checkSlug }) {
        if (!checkSlug && this.generateSlug) {
          this.slugUnique = true
        } else if (checkSlug) {
          this.slugErrors = ['Your link needs to be unique']
        }
        return checkSlug
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
