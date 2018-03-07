import axios from 'axios'

export default {
  getUser: id => {
    console.log(`Getting user for ${id}`)
    return axios.get('https://uinames.com/api/?ext')
  }
}
