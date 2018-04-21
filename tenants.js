const R = require('rambda')
const fs = require('fs')
const path = require('path')
const tenantId = ~~process.env.VUE_APP_TENANT_ID
const tenantOptions = {
  name: 'Veridian Dynamics',
  logoPath: 'veridian.jpg'
}

if (R.equals(tenantId, 1001)) {
  tenantOptions.name = 'Hexly'
  tenantOptions.logoPath = 'logo.png'
}

if (R.equals(tenantId, 1004)) {
  tenantOptions.name = 'Green HoriZen'
  tenantOptions.logoPath =
    'https://res.cloudinary.com/hexly/image/upload/v1524349012/greenhorizen.png'
}

const contents = `
/* eslint-disable */
export default ${JSON.stringify(tenantOptions)}
`

fs.writeFileSync(path.resolve(__dirname, 'src/tenant.js'), contents)
