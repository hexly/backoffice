<template>
  <div>
    <template v-if="loading > 0">
      <div class="text-center pa-3">
        <v-progress-circular indeterminate :size="30" :width="3" color="grey"></v-progress-circular>
        <h5>Loading Announcements</h5>
      </div>
    </template>
    <template v-if="loading === 0 && posts.length === 0">
      <div class="text-center pa-3">
        <h5>There are no annoucements at this time.</h5>
        <h5>Please check back later.</h5>
      </div>
    </template>
    <template v-else>
      <v-card v-for="post in posts" class="ma-2" :key="post.node.date">
        <v-card-title>
          <p class="headline">{{post.node.title}}</p>
        </v-card-title>
        <v-card-text v-html="post.node.content"></v-card-text>
        <v-card-actions>
          <small>{{$moment(post.node.date).format('ll')}}</small>
        </v-card-actions>
      </v-card>
    </template>
  </div>
</template>

<script>
import * as _ from 'lodash'
import { GET_RECENT_POST } from '@/graphql/wordpress/Posts.gql'

export default {
  name: 'Announcements',
  data() {
    return {
      posts: [],
      loading: 0
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
        return edges
      },
      loadingKey: 'loading',
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
