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
      <mapbox
        v-else
        class="map"
        :access-token="accessToken"
        :map-options="{
          style: mapStyle,
          center: [-61.5, 42],
          zoom: zoom,
        }"
        @map-load="addMarkers"
      />
    </v-card>
  </div>
</template>

<script>
import Mapbox from 'mapbox-gl-vue'
import { LAT_LONGS } from '@/graphql/Contacts.js'

const tenantId = ~~process.env.VUE_APP_TENANT_ID

export default {
  components: {
    Mapbox
  },
  props: {
    title: String
  },
  data() {
    return {
      zoom: Math.min(window.innerWidth / 320, 2.5),
      coordinates: [],
      accessToken: process.env.VUE_APP_MAPBOX_ACCESS_TOKEN,
      mapStyle: process.env.VUE_APP_MAPBOX_MAP_STYLE
    }
  },
  methods: {
    addMarkers(map) {
      const mapboxgl = require('mapbox-gl/dist/mapbox-gl')
      this.coordinates.forEach((marker) => {
        // create a HTML element for each feature
        const el = document.createElement('div')
        el.className = 'Map__marker'

        // make a marker for each feature and add to the map
        new mapboxgl.Marker(el)
          .setLngLat([marker.long, marker.lat])
          .addTo(map)
      })
    }
  },
  apollo: {
    coordinates: {
      query: LAT_LONGS,
      variables() {
        return {
          input: {
            tenantId,
            limit: 1500
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
.Map__marker{
  background-color: #EB8381;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0px 0px 16px 0px #EB8381;
}
</style>
