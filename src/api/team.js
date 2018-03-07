import axios from 'axios'

export default {
  getTeam: id => {
    console.log(`Getting team for user ${id}`)
    return axios
      .get('https://uinames.com/api/?amount=12&ext')
      .then(response => response.data)
  }
}
