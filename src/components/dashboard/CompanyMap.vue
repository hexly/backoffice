<template>
  <div class="company-map">
    <v-card>
      <v-card-title class="secondary white--text headline">
        {{title}}
      </v-card-title>
      <div v-if="coordinates.length === 0"
        class="title grey--text text--lighten-1 font-weight-light map text-xs-center pt-5"
      >
        <p>
          Loading Map
          <v-progress-circular indeterminate :size="30" :width="3" color="grey"></v-progress-circular>
        </p>
      </div>
      <MglMap
        v-else
        class="map"
        :accessToken="accessToken"
        :mapStyle.sync="mapStyle"
        :boxZoom="false"
        :zoom="2.7"
        :center="[-61.5, 42]"
        >
        <MglMarker v-for="c in coordinates" :key="c[0]" :coordinates="[c.long, c.lat]" color="blue"></MglMarker>
      </MglMap>
    </v-card>
  </div>
</template>

<script>
import { MglMap, MglMarker } from 'vue-mapbox'
import { LAT_LONGS } from '@/graphql/Contacts.js'

const tenantId = ~~process.env.VUE_APP_TENANT_ID

export default {
  components: {
    MglMap,
    MglMarker
  },
  props: {
    title: String
  },
  data() {
    return {
      coordinates: [],
      accessToken: process.env.VUE_APP_MAPBOX_ACCESS_TOKEN,
      mapStyle: process.env.VUE_APP_MAPBOX_MAP_STYLE
    }
  },
  apollo: {
    coordinates: {
      query: LAT_LONGS,
      variables() {
        return {
          input: {
            tenantId,
            limit: 150
          }
        }
      },
      update({ latLongByTenant }) {
        return latLongByTenant
      }
    }
  }
}
</script>

<style>
.map {
  width: 100%;
  height: 500px;
  margin: auto;
}
.map > div{
  height: 100%;
}
</style>
