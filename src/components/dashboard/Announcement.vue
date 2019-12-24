<template>
  <v-card v-if="post.content">
    <v-card-title>
      <p class="headline">{{post.title}}</p>
    </v-card-title>
    <v-card-text v-html="post.content"></v-card-text>
    <v-card-actions>
      <small>{{post.date}}</small>
    </v-card-actions>
  </v-card>
</template>

<script>
import { GET_RECENT_POST } from '@/graphql/wordpress/Posts.gql'

export default {
  name: 'Announcement',
  data() {
    return {
      post: {}
    }
  },
  apollo: {
    post: {
      query: GET_RECENT_POST,
      variables() {
        return {
          first: 1,
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
      client: 'wordpress'
    }
  }
}
</script>

<style scoped>

</style>
