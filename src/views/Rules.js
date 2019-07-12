export default {
  requiredRule: [
    v => !!v || 'This field is required'
  ],
  emailRule: [
    v => !!v || 'This field is required',
    v =>
      (v && /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(v)) ||
      'Please enter a valid email address'
  ],
  slugRule: [
    v => !!v || 'Field is required and cannot be changed once submitted',
    v =>
      (v && /^[a-zA-Z0-9]+(?:-[a-z0-9]+)*$/.test(v)) ||
      'Store name must not have spaces or special characters',
    v => {
      return (
        (v && v.length <= 20 && v.length >= 4) ||
        'Store name must be between 4 and 20 characters'
      )
    }
  ],
  birthdateRule: [
    v => !!v || 'Field is required'
  ]
}
