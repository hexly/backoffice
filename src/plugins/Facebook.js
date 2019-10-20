const install = function (Vue, options) {
  window.fbAsyncInit = function () {
    console.log('SETTING UP FACEBOOK')
    window.FB.init({
      appId: options.appId,
      cookie: true,
      xfbml: true,
      version: 'v4.0'
    }, { scope: 'read_custom_friendlists' })

    window.FB.AppEvents.logPageView()

    window.FB.getLoginStatus((response) => {
      console.log('status', response)
    })

    Vue.$FB = window.FB
  }
  Vue.$FB = null

  ;(function (d, s, id) {
    console.log('starting', d, s, id)
    var js; var fjs = d.getElementsByTagName(s)[0]
    console.log({ fjs })
    if (d.getElementById(id)) { return }
    js = d.createElement(s)
    js.id = id
    js.src = 'https://connect.facebook.net/en_US/sdk.js'
    js.async = true
    fjs.parentNode.insertBefore(js, fjs)
    console.log({ js })
    console.log({ fjs })
    console.log('ending')
  }(window.document, 'script', 'facebook-jssdk'))
}

export default {
  install
}
