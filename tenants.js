const R = require('rambda')
const fs = require('fs')
const path = require('path')
const tenantId = ~~process.env.VUE_APP_TENANT_ID || ~~process.env.npm_config_tenant_id
let tenantOptions = {
  name: 'Veridian Dynamics',
  logoPath: '/img/1000/logo.png',
  logoLoginPath: '/img/1000/logo-login.png',
  placeholder: '/img/1000/profile.jpeg',
  baseColor: '#262223',
  primaryColor: '#bf214b',
  secondaryColor: '#bf4565',
  accentColor: '#f2d0dd',
  storeUrl: 'http://www.veridian-dynamics.org/',
  corporateUrl: 'http://www.veridian-dynamics.org/',
  social: [
    {
      key: 'facebook',
      url: 'http://www.veridian-dynamics.org/'
    }
  ]
}

if (R.equals(tenantId, 1001)) {
  tenantOptions = {
    name: 'Hexly',
    logoPath: '/logo.png'
  }
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
    ],
    agreements: [
      {
        key: 'affiliate',
        name: 'Independent Contractor Agreement',
        url: '/docs/1004/Consultant_Agreement_(March_2018).pdf'
      },
      {
        key: 'policies',
        name: 'Policies and Procedures',
        url: '/docs/1004/Policies_and_Procedures_(April_2018).pdf'
      }
    ]
  }
} else if (R.equals(tenantId, 1008)) {
  tenantOptions = {
    name: 'GoMana',
    logoPath: '/img/1000/logo.png',
    logoLoginPath: '/img/1000/logo-login.png',
    placeholder: '/img/1000/profile.png',
    baseColor: '#2c3e49',
    primaryColor: '#4cad49',
    secondaryColor: '#287524',
    accentColor: '#3c8c25',
    storeUrl: 'https://go-mana.com/',
    corporateUrl: 'https://go-mana.com/',
    social: [
      {
        key: 'facebook',
        url: 'http://www.veridian-dynamics.org/'
      }
    ]
  }
} else if (R.equals(tenantId, 1009)) {
  tenantOptions = {
    name: 'Kyngdom Organizer',
    logoPath: '/img/1009/logo.jpg',
    logoLoginPath: '/img/1009/logo.jpg',
    placeholder: '/img/1009/logo.jpg',
    baseColor: '#2b3ea0',
    primaryColor: '#fe4943',
    secondaryColor: '#2ea3f2',
    accentColor: '#fdaa58',
    storeUrl: 'https://www.kyngdomorganizer.com/store/{slug}',
    corporateUrl: 'https://www.kyngdomorganizer.com/',
    social: [
      {
        key: 'facebook',
        url: 'https://www.facebook.com/Kyngdom-Organizer-187348015476222/'
      }
    ],
    agreements: [
      {
        key: 'affiliate',
        name: 'Independent Contractor Agreement',
        url: '/docs/1009/AffiliateAgreement.pdf'
      },
      {
        key: 'policies',
        name: 'Policies and Procedures',
        url: '/docs/1009/PoliciesProcedures.pdf'
      }
    ]
  }
}

const contents = `
/* eslint-disable */
export default ${JSON.stringify(tenantOptions)}
`

fs.writeFileSync(path.resolve(__dirname, 'src/tenant.js'), contents)
