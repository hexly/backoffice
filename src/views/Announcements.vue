<template>
  <div>
    <v-card v-for="post in posts" :key="post.date">
      <v-card-title>
        <p class="headline">{{post.title}}</p>
      </v-card-title>
      <v-card-text v-html="post.content"></v-card-text>
      <v-card-actions>
        <small>{{post.date}}</small>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import * as _ from 'lodash'
import { GET_RECENT_POST } from '@/graphql/wordpress/Posts.gql'

export default {
  name: 'Announcements',
  data() {
    return {
      posts: []
    }
  },
  apollo: {
    posts: {
      query: GET_RECENT_POST,
      variables() {
        return {
          first: 25,
          where: {
            categoryName: 'hub-announcement',
            orderby: [{
              field: 'DATE',
              order: 'DESC'
            }]
          }
        }
      },
      update(data) {
        const { posts: { edges } } = data
        return edges[0].node
      },
      client: 'wordpress',
      skip: function() {
        return !_.get(this, '$apolloProvider.clients.wordpress')
      }
    }
  }
}
</script>

<style scoped>

</style>
