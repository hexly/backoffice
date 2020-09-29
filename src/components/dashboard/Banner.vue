<template>
  <v-card>
    <v-card-title>
      <p class="headline">{{banner.name}}</p>
    </v-card-title>
    <v-card-text v-html="banner.description"></v-card-text>
    <v-card-text>
      <v-progress-linear :value="progress" :height="25" rounded stream>
        <div class="message" v-if="message" v-html="message"/>
      </v-progress-linear>
    </v-card-text>
    <!-- <v-card-actions>
      <small>Date?</small>
    </v-card-actions> -->
  </v-card>
</template>

<script>

export default {
  props: {
    banner: Object
  },
  computed: {
    progress() {
      return this.banner.results.progress * 100
    },
    message() {
      const messages = this._.get(this, 'banner.metadata.messages.valueRanges')
      if (messages) {
        const { progress } = this
        let { numerator, denominator } = this.banner.results
        numerator = 30
        const match = messages.find(msg => numerator >= msg.min && (msg.max === undefined || msg.max >= numerator))
        if (match) {
          let message = match.message
          ;[numerator, denominator].forEach((val, idx) => {
            message = message.replace(`%${idx + 1}`, val)
          })
          return message
        } else {
          console.warn('Detected value range messages, but did not match any', { progress, numerator, denominator })
          // return 'no messages?'
        }
      }
      // return 'Here we go'
    }
  }
}
</script>

<style scoped>
.message {
  color: #fff;
  text-shadow: 1px 1px 1px #000;
}
</style>
