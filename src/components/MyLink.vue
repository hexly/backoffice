<template>
  <div>
    <div v-if="slug">
      {{$tenantInfo.storeUrl.replace('{slug}', slug)}}
    </div>
    <div v-else>
      Hey There! You do not have your link set up yet.
      <v-text-field
        label="Your Store Link"
        class="mb-3"
        v-model="tempSlug"
        @keyup="slugChanged"
        :rules="slugRule"
        :error-messages="slugErrors"
        outline
        :prefix="$tenantInfo.storeUrl.replace('{slug}', '')"
      ></v-text-field>
      <v-btn :disabled="!slugUnique" type="primary">Create Link</v-btn>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex'
import Rules from '@/views/Rules.js'
import CHECK_IF_UNIQUE_SLUG from '@/graphql/Slug.gql'
import { UserMutations } from '@/stores/UserStore'

const tenantId = ~~process.env.VUE_APP_TENANT_ID

export default {
  name: 'MyLink',
  data() {
    return {
      tempSlug: '',
      slugUnique: false,
      checkingSlug: 0,
      slugErrors: [],
      slugRule: Rules.slugRule
    }
  },
  methods: {
    async slugChanged(event) {
      this.slugUnique = false
      if (this.checkingSlug > 0) {
        this.$apollo.queries.checkSlug.stop()
      }
      this.$apollo.queries.checkSlug.start()
    },
    ...mapMutations({
      setSlug: UserMutations.SET_SLUG
    })
  },
  computed: {
    ...mapGetters(['slug'])
  },
  apollo: {
    checkSlug: {
      query: CHECK_IF_UNIQUE_SLUG,
      variables: {
        input: {
          tenantId: tenantId,
          slug: this.slug
        }
      },
      loadingKey: 'checkingSlug',
      skip() {
        return !this.slug && this.tempSlug
      },
      result({ findMemberBySlug }, key) {
        console.log(findMemberBySlug)
      }
    }
  }
}
</script>
