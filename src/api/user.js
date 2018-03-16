import axios from 'axios'

export default {
  getUser: id => {
    return axios.get('https://uinames.com/api/?ext')
  }
}
