<template>
  <v-flex xs12>
    <div class="about">
      <h1>Sales</h1>
      <v-data-table
        :headers="headers"
        :items="items"
        hide-actions
        class="elevation-1"
      >
        <template slot="items" slot-scope="props">
          <td>{{ props.item.name }}</td>
          <td class="text-xs-right">{{ props.item.date }}</td>
          <td class="text-xs-right">{{ props.item.customerName }}</td>
          <td class="text-xs-right">{{ props.item.total }}</td>
          <td class="text-xs-right">{{ props.item.points }}</td>
        </template>
      </v-data-table>
    </div>
  </v-flex>
</template>

<script>
export default {
  data() {
    return {
      headers: [
        {
          text: 'Item',
          align: 'left',
          sortable: false,
          value: 'name'
        },
        { text: 'Date', value: 'date' },
        { text: 'Customer', value: 'customerName' },
        { text: 'Sale Total', value: 'total' },
        { text: 'Total Points', value: 'points' }
      ],
      items: [
        {
          name: 'Item #23',
          date: new Date(),
          customerName: 'Lucille Bluth',
          total: 2000,
          points: 20
        },
        {
          name: 'Item #11',
          date: new Date(),
          customerName: 'Marge Simpson',
          total: 4300,
          points: 43
        },
        {
          name: 'Item #3',
          date: new Date(),
          customerName: 'Lindsay Bluth',
          total: 800,
          points: 8
        },
        {
          name: 'Item #8',
          date: new Date(),
          customerName: 'Maeby Fünke',
          total: 1800,
          points: 18
        },
        {
          name: 'Item #19',
          date: new Date(),
          customerName: 'Celia Mae',
          total: 990,
          points: 9
        },
        {
          name: 'Item #1',
          date: new Date(),
          customerName: 'Sheri Squibbles',
          total: 1000,
          points: 10
        },
        {
          name: 'Item #15',
          date: new Date(),
          customerName: 'Ms. Nesbit',
          total: 2100,
          points: 21
        }
      ]
    }
  }
}
</script>
