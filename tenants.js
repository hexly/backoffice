const R = require('rambda')
const fs = require('fs')
const path = require('path')
const tenantId = ~~process.env.VUE_APP_TENANT_ID
let tenantOptions = {
  name: 'Veridian Dynamics',
  logoPath: '/veridian.jpg'
}

if (R.equals(tenantId, 1001)) {
  tenantOptions.name = 'Hexly'
  tenantOptions.logoPath = '/logo.png'
}

if (R.equals(tenantId, 1004)) {
  tenantOptions = {
    name: 'Green HoriZen',
    logoPath: '/img/1004/logo.png',
    logoLoginPath: '/img/1004/logo-login.png',
    placeholder: '/img/1004/profile.png',
    baseColor: '#373331',
    primaryColor: '#A0CE4E',
    secondaryColor: '#C968A7',
    accentColor: '#F7E8AB',
    storeUrl: 'https://www.mygreenhorizen.com/store/{slug}',
    corporateUrl: 'https://www.mygreenhorizen.com/',
    social: [
      {
        key: 'facebook',
        url: 'https://www.facebook.com/GreenHoriZen/'
      }
    ]
  }
}

const contents = `
/* eslint-disable */
export default ${JSON.stringify(tenantOptions)}
`

fs.writeFileSync(path.resolve(__dirname, 'src/tenant.js'), contents)
