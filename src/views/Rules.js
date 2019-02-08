export default {
  slugRule: [
    v => !!v || 'Field is required',
    v =>
      (v && /^[a-zA-Z0-9]+(?:-[a-z0-9]+)*$/.test(v)) ||
      'Store name must not have spaces or special characters',
    v => {
      return (
        (v && v.length <= 20 && v.length >= 4) ||
        'Store name must be between 4 and 20 characters'
      )
    }
  ]
}
