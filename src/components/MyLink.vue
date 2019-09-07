<template>
  <div>
    <div v-if="slug">
      <v-text-field
        solo
        color="black"
        :value="formattedSlug"
        readonly
        single-line>
        <v-tooltip slot="append" bottom>
            <v-icon @click="copyToClipboard" slot="activator" color="black" dark>assignment</v-icon>
            <span>{{copyTooltipText}}</span>
        </v-tooltip>
      </v-text-field>
    </div>
    <div v-else>
      Hey There! You do not have your link set up yet.
      <v-text-field
        :loading="savingSlug"
        placeholder="my-personal-link"
        class="mb-3 slug-field"
        v-model="tempSlug"
        @keyup="slugChanged"
        :rules="slugRule"
        :error-messages="slugErrors"
        outline
        :prefix="$tenantInfo.storeUrl.replace('{slug}', '')"
      ></v-text-field>
      <v-btn :loading="savingSlug" @click="saveSlug" :disabled="!slugUnique" type="primary">Create Link</v-btn>
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
      slugUnique: false,
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
    async slugChanged(event) {
      this.slugUnique = false
      if (this.checkingSlug > 0) {
        this.$apollo.queries.checkSlug.stop()
      }
      this.$apollo.queries.checkSlug.start()
    },
    async saveSlug() {
      this.savingSlug = true
      const { data: { addMemberSlug } } = await this.$apollo.mutate({
        mutation: ADD_MEMBER_SLUG,
        variables: {
          input: {
            tenantId,
            slug: this.tempSlug
          }
        }
      })
      this.setSlug(addMemberSlug[0].slug)
      this.savingSlug = false
    },
    ...mapMutations({
      setSlug: UserMutations.SET_SLUG
    })
  },
  computed: {
    ...mapGetters(['slug']),
    formattedSlug() {
      return this.$tenantInfo.storeUrl.replace('{slug}', this.slug || this.tempSlug)
    }
  },
  apollo: {
    checkSlug: {
      query: CHECK_IF_UNIQUE_SLUG,
      variables() {
        return {
          input: {
            tenantId,
            slug: this.tempSlug
          }
        }
      },
      loadingKey: 'checkingSlug',
      skip() {
        return (!this.slug && this.tempSlug)
      },
      update({ findMemberBySlug }) {
        if (!findMemberBySlug && this.tempSlug) {
          this.slugUnique = true
        }
        return findMemberBySlug
      }
    }
  }
}
</script>

<style>
.slug-field .v-text-field__prefix {
  white-space: nowrap;
}
</style>
