const moment = require('moment')
let birthdayFormat = 'MM/DD/YYYY'
if (Intl.DateTimeFormat().resolvedOptions()) {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale
  if (locale.toLowerCase().indexOf('gb') > -1) {
    birthdayFormat = 'DD/MM/YYYY'
  }
}
export default {
  birthdayFormat,
  requiredRule: [
    v => !!v || 'This field is required'
  ],
  emailRule: [
    v => !!v || 'This field is required',
    v =>
      (v && /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/.test(v)) ||
      'Please enter a valid email address'
  ],
  slugRule: [
    v => !!v || 'Field is required and cannot be changed once submitted',
    v =>
      (v && /^[a-z0-9\-\\_]*$/.test(v)) ||
      'Store name must not have spaces or special characters',
    v => {
      return (
        (v && v.length <= 20 && v.length >= 4) ||
        'Store name must be between 4 and 20 characters'
      )
    }
  ],
  passwordRule: [
    v => !!v || 'Field is required',
    v => (v && v.length > 8) || 'Password must be more than 8 characters'
  ],
  birthdateRule: [
    v => moment(v, birthdayFormat).isValid() || `Birthday Must Be in ${birthdayFormat} Format`
  ]
}
