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
  },
  load(principal) {
    return () => {
      window.$crisp.set('session:data', [
        [
          ['displayName', principal.displayName],
          ['identityId', principal.identityId],
          ['username', principal.username],
          ['memberId', principal.member.id]
        ]
      ])
      window.$crisp.set('user:nickname', principal.member.name)
      window.$crisp.set('user:email', principal.username)
    }
  }
}
