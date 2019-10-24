const install = function (Vue, options) {
  window.fbAsyncInit = function () {
    window.FB.init({
      appId: options.appId,
      cookie: true,
      xfbml: true,
      version: 'v4.0'
    }, { scope: 'read_custom_friendlists' })

    window.FB.AppEvents.logPageView()

    window.FB.getLoginStatus((response) => {
      options.ready()
    })
  }

  ;(function (d, s, id) {
    var js; var fjs = d.getElementsByTagName(s)[0]
    if (d.getElementById(id)) { return }
    js = d.createElement(s)
    js.id = id
    js.async = true
    js.src = 'https://connect.facebook.net/en_US/sdk.js'
    fjs.parentNode.insertBefore(js, fjs)
  }(window.document, 'script', 'facebook-jssdk'))
}

export default {
  install
}
