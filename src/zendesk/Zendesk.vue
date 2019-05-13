<template>
  <v-content class="zendesk">
    <v-container fluid fill-height>
      <v-layout align-center justify-center>
        <v-flex xs12 sm8 md8>
          <v-card class="elevation-12">
            <v-toolbar dark color="secondary">
              <v-toolbar-title>Zendesk Support</v-toolbar-title>
            </v-toolbar>
            <v-progress-linear
              class="ma-0"
              :indeterminate="true"
              :active="this.$apollo.queries.supportUsers.loading"
            />
            <v-card-text v-if="this.$apollo.queries.supportUsers.loading">
              <p>Please wait while we load your accounts...</p>
            </v-card-text>
            <v-card-text v-else-if="supportUsers.length > 0">
              <p>Please select which account you'd like to connect to support with:</p>
              <ul>
                <li v-for="(user, idx) in supportUsers" :key="idx">
                  <a @click="selectUser(user)">{{user.identifier}}</a>
                  <pre style="display: none">
                    {{ user.claims }}
                  </pre>
                </li>
              </ul>
            </v-card-text>
            <v-card-text v-else>
              <p>It doesn't look like you have any support accounts. Please contact support if you feel there's an error.</p>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
</template>

<script>

import * as gql from './zendesk.gql'

export default {
  data() {
    return {
      supportUsers: []
    }
  },
  methods: {
    async selectUser(user) {
      const { agentId, memberId } = user
      this.$apollo.mutate({
        mutation: gql.zendeskAuth,
        variables: {
          input: {
            action: 'AUTH',
            metadata: { agentId, memberId }
          }
        },
        update: (store, { data = {} }) => {
          const { supportUserCommand: { metadata } } = data
          if (metadata && metadata.token) {
            const url = `${process.env.VUE_APP_ZENDESK_BASE_URL}/access/jwt?jwt=${metadata.token}`
            window.open(url, '_blank')
          } else {
            console.warn('Failed to get response from GraphQL')
          }
        }
      })
    }
  },
  apollo: {
    supportUsers: {
      query: gql.zendeskUsers,
      variables() {
        return {
          input: {
            memberIds: [this.$store.state.user.principal.memberId]
          }
        }
      },
      update({ supportUsers = [] }) {
        return supportUsers.results || []
      }
    }
  }
}
</script>
