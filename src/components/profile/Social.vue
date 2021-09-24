<template>
  <div>
    <v-layout row wrap justify-center class="my-2">
      <v-flex xs12 md6 lg4 class="text-center">
        <Facebook
          ref="facebook"
          v-if="social['facebook']"
          :loading="loading['facebook']"
          @sync="sync"
          @ready="ready"
          :appId="social['facebook'].metadata.appId"
        />
      </v-flex>
    </v-layout>
    <v-layout justify-center row v-for="a in accounts" :key="a.id">
      <v-flex xs12 sm6>
        <v-divider></v-divider>
        <v-layout align-center row spacer class="py-2">
          <v-flex xs4 sm2 md1>
            <v-avatar size="36px" >
              <img v-if="a.profilePic" :src="a.profilePic" alt="Avatar" />
            </v-avatar>
          </v-flex>
          <v-flex xs4 sm4 md1>
            <strong>{{a.name}}</strong>
          </v-flex>
          <v-flex xs5 sm3 md9>
            <strong>{{a.displayName}}</strong>
            <br v-if="a.displayName"/>
            <small class="text--grey">({{a.integrationOid}})</small>
          </v-flex>
          <v-flex xs1>
            <v-progress-circular v-if="removing === a.id" indeterminate color="grey"></v-progress-circular>
            <v-tooltip v-else slot="append" right>
              <v-icon slot="activator" @click="unlink(a)">clear</v-icon>
              <span>Unlink Account</span>
            </v-tooltip>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import Facebook from '@/components/profile/Facebook.vue'
import { UserActions } from '@/stores/UserStore'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'Social',
  components: {
    Facebook
  },
  data() {
    return {
      accounts: [],
      social: {
        facebook: null
      },
      loading: {
        facebook: false
      },
      removing: null,
      accountMap: {},
      accountPerSocial: {}
    }
  },
  mounted() {
    this.load()
  },
  methods: {
    ...mapActions([UserActions.SAVE_PROFILE, UserActions.CREATE_INTEGRATION, UserActions.REMOVE_INTEGRATION]),
    load() {
      this.integrations.forEach(i => {
        this.social[i.key] = i
      })
      this.tenantIntegrations.forEach(i => {
        this.accountMap[`${i.key}-${i.integrationOid}`] = i
        if (this.accountPerSocial[i.key]) {
          this.accountPerSocial[i.key].push(i)
        } else {
          this.accountPerSocial[i.key] = [i]
        }
      })
    },
    ready(key) {
      if (this.accountPerSocial[key]) {
        this.accountPerSocial[key].forEach(async a => {
          const details = await this.$refs[key].lookup(a)
          this.accounts.push({
            ...details,
            profilePic: this.$refs[key].pic(details.integrationOid)
          })
        })
      }
    },
    async sync({ auth, ids, key, profileUrl }) {
      const { userID, accessToken, signedRequest } = auth
      if (!this.accountMap[`${key}-${userID}`]) {
        this.loading[key] = true
        if (!this.principal.member.profileUrl) {
          await this.saveProfile({ memberId: this.principal.member.id, profileUrl })
        }
        let priority = -1
        if (this.accountPerSocial[key]) {
          this.accountPerSocial[key].forEach(a => {
            if (a.priority > priority) {
              priority = a.priority
            }
          })
        }
        await this.createIntegration({
          command: `member_${key}_connect`,
          tenantIntegrationId: this.social[key].id,
          data: {
            userID,
            accessToken,
            signedRequest,
            knownFriendOids: ids,
            priority: priority + 1
          }
        })
      }
    },
    async unlink(details) {
      this.removing = details.id
      await this.removeIntegration({
        command: `member_${details.key}_disconnect`,
        tenantIntegrationId: this.social[details.key].id,
        data: {
          id: details.id,
          userID: details.integrationOid
        }
      })
      const index = this.accounts.findIndex(i => details.id === i.id)
      this.accounts.splice(index, 1)
    }
  },
  computed: {
    ...mapState({
      tenantIntegrations: state => state.user.principal.member.integrations || [],
      integrations: state => state.user.principal.tenant.integrations,
      principal: state => state.user.principal
    })
  }
}
</script>

<style scoped>

</style>
