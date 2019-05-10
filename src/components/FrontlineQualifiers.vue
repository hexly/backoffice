<template>
  <v-card>
    <v-list two-line>
      <div v-for="(item, index) in leaders" :key="`${item.contactEmail}-${index}`">
        <v-list-tile
          :key="item.name"
          avatar
          class="progress"
          :style="`background-image: -webkit-linear-gradient(left, rgb(160, 206, 78, 0.1) ${item.totalPoints/60*100}%, #ffffff ${item.totalPoints/60*100}%);`">
          <v-list-tile-avatar>
            <img :src="scaleImage(item.profileUrl)">
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>{{index + 1}}.- {{item.name}}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action >
            <v-list-tile-title >{{ item.totalPoints.toFixed(2) }}/60</v-list-tile-title>
          </v-list-tile-action>
        </v-list-tile>
      </div>
    </v-list>
    <div v-if="leaders.length < 5"></div>
  </v-card>
</template>

<script>
export default {
  name: 'FrontlineQualifiers',
  data() { return { } },
  props: {
    leaders: Array,
    title: String,
    currency: {
      type: Boolean,
      default: false
    },
    showTotal: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    scaleImage (image) {
      if (image) {
        return image.replace('/image/upload', '/image/upload/w_80')
      }
      return image
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
