export default {
  install(Vue, config) {
    if (config.CRISP_WEBSITE_ID) {
      window.$crisp = []
      window.CRISP_WEBSITE_ID = config.CRISP_WEBSITE_ID
      const d = document
      const s = d.createElement('script')
      s.src = 'https://client.crisp.chat/l.js'
      s.async = 1
      d.getElementsByTagName('head')[0].appendChild(s)
    } else {
      console.warn('No Crisp id found, Crip is not set up')
    }
  }
}
