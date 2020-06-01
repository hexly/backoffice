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
    strings: {},
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
    },
    strings: {}
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
    strings: {},
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
    strings: {},
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
    primaryColor: '#142479',
    secondaryColor: '#ffc63a',
    accentColor: '#142479',
    storeUrl: 'https://{slug}.kyngdomorganizer.com',
    corporateUrl: 'https://www.kyngdomorganizer.com/',
    encryptKey: 'kyngdom-organizer',
    social: [
      {
        key: 'facebook',
        url: 'https://www.facebook.com/Kyngdom-Organizer-187348015476222/'
      }
    ],
    strings: {},
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
      legal: true,
      payouts: true
    }
  },
  1010: {
    name: 'Everra',
    logoPath: '/img/1010/logo.png',
    logoLoginPath: '/img/1010/logo.png',
    placeholder: '/img/1010/placeholder.png',
    profileColor: '#a1213b',
    baseColor: '#292425',
    primaryColor: '#a1213b',
    secondaryColor: '#a1213b',
    accentColor: '#fcc19f',
    storeUrl: 'https://www.everra.com/store/{slug}',
    corporateUrl: 'https://www.everra.com/',
    encryptKey: 'luccii', // leave this, it is important
    companyTime: 'America/Los_Angeles',
    social: [
      {
        key: 'facebook',
        url: 'https://www.facebook.com/groups/EverraOfficial/'
      }
    ],
    strings: {
      stripeConnect: 'Everra Connect'
    },
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
      annoucements: true,
      sales: true,
      team: true,
      activity: true,
      dashboard: {
        payoutHistory: false
      },
      legal: {
        docs: true,
        ssn: false
      },
      social: true,
      payouts: true
    }
  }
}

const contents = `
/* eslint-disable */
export default ${JSON.stringify(tenantOptions[tenantId] || tenantOptions[1000])}
`

fs.writeFileSync(path.resolve(__dirname, 'src/tenant.js'), contents)
