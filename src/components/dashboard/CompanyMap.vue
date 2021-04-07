<template>
  <div class="company-map">
    <v-card>
      <v-card-title class="secondary white--text headline">
        {{title}}
      </v-card-title>
      <div v-if="coordinates.length === 0"
        class="title grey--text text--lighten-1 font-weight-light map text-center pt-5"
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

import tenantInfo from '@/tenant.js'

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
  computed: {
    geoData() {
      const data = {
        type: 'FeatureCollection',
        features: []
      }
      this.coordinates.forEach(c => {
        data.features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [c.long, c.lat]
          }
        })
      })
      return data
    }
  },
  methods: {
    addMarkers(map) {
      map.addSource('members', {
        type: 'geojson',
        data: this.geoData,
        cluster: true,
        clusterRadius: 20
      })
      map.addLayer({
        id: 'points',
        type: 'circle',
        source: 'members',
        paint: {
          'circle-color': [ 'step', ['get', 'point_count'], tenantInfo.primaryColor, 100, tenantInfo.primaryColor, 750, tenantInfo.primaryColor ],
          'circle-radius': [ 'step', ['get', 'point_count'], 10, 100, 20, 750, 30 ]
        }
      })
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'members',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        },
        paint: {
          'text-color': '#ffffff'
        }
      })
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'members',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': tenantInfo.primaryColor,
          'circle-radius': 4,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff'
        }
      })
      // const mapboxgl = require('mapbox-gl/dist/mapbox-gl')
      // this.coordinates.forEach((marker) => {
      //   // create a HTML element for each feature
      //   const el = document.createElement('div')
      //   el.className = 'Map__marker'

      //   // make a marker for each feature and add to the map
      //   new mapboxgl.Marker(el)
      //     .setLngLat([marker.long, marker.lat])
      //     .addTo(map)
      // })
    }
  },
  apollo: {
    coordinates: {
      query: LAT_LONGS,
      variables() {
        return {
          input: {
            tenantId: this.$tenantId,
            limit: 20000
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
