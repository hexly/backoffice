<template>
  <v-card class="pa-3 stats-card">
    <h4 class="name">{{title}}</h4>
    <h3 class="stat" v-if="amount">
      <Currency :amount="amount" />
    </h3>
    <div class="trend" v-if="trend">
      <div v-if="trend < 0">
        <small>
          <span class="red--text">{{trend}}</span>
          under last month
          </small>
      </div>
      <div v-if="trend > 0">
          <small>
            <span class="green--text">+{{trend}}</span>
            over last month
          </small>
      </div>
      <div v-if="trend === 0">
        <small>you are on track with last month</small>
      </div>
    </div>
    <slot></slot>
  </v-card>
</template>

<script>
import Currency from '@/components/Currency.vue'

export default {
  name: 'StatsCard',
  components: {
    Currency
  },
  props: {
    title: String,
    amount: Number,
    trend: Number
  }
}
</script>

<style scoped>
.stats-card {
  height: 100%;
}

.stats-card.full {
  height: 100%;
}

.stats-card .name {
  font-size: 12px;
  color: #666666;
  font-weight: normal;
}

.stats-card .stat {
  font-size: 24px;
  color: #000000;
  font-weight: normal;
}

.stats-card .trend {
  vertical-align: middle;
}

.stats-card .sparks {
  min-height: 168px;
  position: relative;
}

.stats-card .sparks svg{
  position: absolute;
  bottom: -25px;
  width: 100%;
  height: 100%;
}

.stats-card section {
  margin-top: 8px;
}

.stats-card section .name{
  text-transform: uppercase;
}

.trend {
  padding-top: 10px;
}
.trend i {
  vertical-align: middle;
  display: inline-block;
  margin-right: 10px;
}

.trend  small {
  color: grey;
}

v-card {
  overflow: hidden;
}

</style>
