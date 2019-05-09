const R = require('rambda')
const fs = require('fs')
const path = require('path')
const tenantId = ~~process.env.VUE_APP_TENANT_ID
const tenantOptions = {
  name: 'Veridian Dynamics',
  logoPath: '/veridian.jpg'
}

if (R.equals(tenantId, 1001)) {
  tenantOptions.name = 'Hexly'
  tenantOptions.logoPath = '/logo.png'
}

if (R.equals(tenantId, 1004)) {
  tenantOptions.name = 'Green HoriZen'
  tenantOptions.logoPath = '/img/1004/logo.png'
  tenantOptions.logoLoginPath = '/img/1004/logo-login.png'
  tenantOptions.incentiveTrip = true
  tenantOptions.placeholder = '/img/1004/profile.png'
  tenantOptions.primaryColor = '#A0CE4E'
  tenantOptions.secondaryColor = '#373331'
}

const contents = `
/* eslint-disable */
export default ${JSON.stringify(tenantOptions)}
`

fs.writeFileSync(path.resolve(__dirname, 'src/tenant.js'), contents)
