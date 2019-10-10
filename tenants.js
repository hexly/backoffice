const fs = require('fs')
const path = require('path')
const tenantId =
  ~~process.env.VUE_APP_TENANT_ID || ~~process.env.npm_config_tenant_id
const tenantOptions = {
  1000: {
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
    encryptKey: 'veridian-dynamics',
    social: [
      {
        key: 'facebook',
        url: 'http://www.veridian-dynamics.org/'
      }
    ],
    features: {
      team: true,
      legal: true
    }
  },
  1001: {
    name: 'Hexly',
    logoPath: '/logo.png',
    features: {
      team: true,
      legal: true
    }
  },
  1004: {
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
    encryptKey: 'green-horizen',
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
    ],
    features: {
      sales: true,
      team: true,
      legal: true
    }
  },
  1008: {
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
    encryptKey: 'go-mana',
    social: [
      {
        key: 'facebook',
        url: 'http://www.veridian-dynamics.org/'
      }
    ],
    features: {
      sales: true,
      team: false,
      legal: false
    }
  },
  1009: {
    name: 'Kyngdom Organizer',
    logoPath: '/img/1009/logo.jpg',
    logoLoginPath: '/img/1009/logo.jpg',
    placeholder: '/img/1009/placeholder.jpeg',
    profileCover: '/img/1009/ko-profile-background.png',
    baseColor: '#2b3ea0',
    primaryColor: '#fe4943',
    secondaryColor: '#2ea3f2',
    accentColor: '#fdaa58',
    storeUrl: 'https://www.kyngdomorganizer.com/store/{slug}',
    corporateUrl: 'https://www.kyngdomorganizer.com/',
    encryptKey: 'kyngdom-organizer',
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
    ],
    features: {
      sales: true,
      team: true,
      legal: true
    }
  },
  1010: {
    name: 'Early Access Beauty',
    // logoPath: '/img/1009/logo.jpg',
    // logoLoginPath: '/img/1009/logo.jpg',
    placeholder: '/img/1010/placeholder.png',
    profileColor: '#fee541',
    baseColor: '#14244C',
    primaryColor: '#3e5b06',
    secondaryColor: '#F2AE45',
    accentColor: '#EB8381',
    storeUrl: 'https://www.earlyaccessbeauty.com/store/{slug}',
    corporateUrl: 'https://www.earlyaccessbeauty.com/',
    encryptKey: 'luccii',
    social: [
      {
        key: 'facebook',
        url: 'https://www.facebook.com/groups/543677573058327/'
      }
    ],
    agreements: [
      {
        key: 'affiliate',
        name: 'Independent Consultant Agreement',
        url: '/docs/1010/Independent-Consultant-Agreement.pdf'
      },
      {
        key: 'policies',
        name: 'Policies and Procedures',
        url: '/docs/1010/Policies-and-Procedures.pdf'
      }
    ],
    privacyPolicy: '/docs/1010/Privacy-Policy.pdf',
    features: {
      sales: false,
      team: false,
      legal: {
        docs: true,
        ssn: false
      }
    }
  }
}

const contents = `
/* eslint-disable */
export default ${JSON.stringify(tenantOptions[tenantId] || tenantOptions[1000])}
`

fs.writeFileSync(path.resolve(__dirname, 'src/tenant.js'), contents)
