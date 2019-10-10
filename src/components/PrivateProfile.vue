<template>
  <div class="pb-3">
     <v-switch
      v-model="member.tags"
      :value="tagName"
      label="Private Profile"
      color="primary"
      @change="change"
      persistent-hint
      hint="Note: Your link will still work. You will not be searchable."
    ></v-switch>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { UserActions } from '@/stores/UserStore'

export default {
  name: 'PrivateProfile',
  data() {
    return {
      tagName: 'omit:publicsearch'
    }
  },
  methods: {
    ...mapActions([UserActions.ADJUST_TAGS]),
    async change(value) {
      if (value.length === 0) {
        // Remove
        await this.adjustTags({
          memberId: this.member.id,
          remove: [this.tagName]
        })
      } else {
        // Add
        await this.adjustTags({
          memberId: this.member.id,
          add: [this.tagName]
        })
      }
    }
  },
  computed: {
    ...mapGetters(['member'])
  }

}
</script>
