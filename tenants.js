const fs = require('fs')
const path = require('path')
const tenantId =
  ~~process.env.VUE_APP_TENANT_ID || ~~process.env.npm_config_tenant_id
const tenantOptions = {
  1000: {
    id: 1000,
    distributorLabel: 'Constituant',
    distributorsLabel: 'Constituants',
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
      legal: true,
      files: false,
      assetTags: {
        files: 'search:files'
      }
    }
  },
  1001: {
    id: 1001,
    distributorLabel: 'Member',
    distributorsLabel: 'Members',
    name: 'Hexly',
    logoPath: '/logo.png',
    features: {
      team: true,
      legal: true,
      files: false,
      assetTags: {
        files: 'search:files'
      }
    },
    strings: {}
  },
  1004: {
    id: 1004,
    distributorLabel: 'Affiliate',
    distributorsLabel: 'Affiliates',
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
      legal: true,
      files: false,
      assetTags: {
        files: 'search:files'
      }
    }
  },
  1008: {
    id: 1008,
    distributorLabel: 'Affiliate',
    distributorsLabel: 'Affiliates',
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
      legal: false,
      files: false,
      assetTags: {
        files: 'search:files'
      }
    }
  },
  1009: {
    id: 1009,
    distributorLabel: 'Affiliate',
    distributorsLabel: 'Affiliates',
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
      legal: true,
      payouts: true,
      files: false,
      assetTags: {
        files: 'search:files'
      }
    }
  },
  1010: {
    id: 1010,
    distributorLabel: 'Influencer',
    distributorsLabel: 'Influencers',
    statMapping: {
      lifetimeTotalPoints: {
        title: 'CPSV',
        description: 'Career Personal Sales Volume'
      },
      personalTotalPoints: {
        title: 'PSV',
        description: 'Personal Sales Volume'
      },
      groupPoints: {
        title: 'GSV',
        description: 'Group Sales Volume'
      },
      activeLeg: {
        title: 'Active Legs',
        description: 'Active Legs'
      },
      downlinePoints: {
        title: 'DSV',
        description: 'Downline Sales volume'
      },
      anyRankCount: {
        title: 'PABQL',
        description: 'Paid-As Bonus Qualified Legs'
      },
      downlineAdjustedPoints: {
        title: 'ADSV',
        description: 'Adjusted Downline Sales volume'
      }
    },
    name: 'Everra',
    logoPath: '/img/1010/logo.png',
    logoLoginPath: '/img/1010/logo.png',
    placeholder: '/img/1010/placeholder.png',
    profileCover: '/img/1010/profile-background-product.jpg',
    // profileColor: '#a1213b',
    baseColor: '#292425',
    primaryColor: '#c44a42',
    secondaryColor: '#c44a42',
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
      stripeConnect: 'Everra Connect',
      files: 'Influencer Resources'
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
    externalLinks: [
      {
        href: 'https://everra.go.customprintcenter.com/LandingPage',
        name: 'ProShop',
        icon: 'business_center'
      },
      {
        href: 'https://www.everra.com/product-category/swag/',
        name: 'Swag Shop',
        icon: 'shopping_basket'
      }
    ],
    features: {
      announcements: true,
      insights: {
        dashboard: true,
        reports: false
      },
      sales: true,
      activity: true,
      profileSettings: true,
      legal: {
        docs: true,
        ssn: false
      },
      team: {
        base: true,
        generations: true,
        activity: true,
        search: true,
        graph: true
      },
      customers: true,
      social: true,
      payouts: true,
      generalDashboard: false,
      files: true,
      assetTags: {
        files: 'search:files'
      },
      dashboard: {
        payoutHistory: true,
        announcements: true,
        personalCard: true,
        personalCardAwards: true,
        personalCardSocial: true,
        rankRequirements: true,
        companyLeaders: true,
        teamLeaders: true,
        teamOverview: true,
        incentives: ['I1010March2020'],
        directory: true,
        map: true
      }
    }
  },
  1011: {
    id: 1011,
    distributorLabel: 'Representative',
    distributorsLabel: 'Representatives',
    trends: {
      teamOverview: false
    },
    statMapping: {
      personalTotalAmount: {
        title: 'PV',
        description: 'Personal Volume'
      },
      personalCommissionablePoints: {
        title: 'CV',
        description: 'Commissionable Volume'
      },
      lifetimeTotalPoints: {
        title: 'LPV',
        description: 'Lifetime Commissionable Volume'
      },
      groupPoints: {
        title: 'GSV',
        description: 'Group Sales Volume'
      },
      activeLeg: {
        title: 'Active Legs',
        description: 'Active Legs'
      }
    },
    name: 'Sucavu',
    logoPath: '/img/1011/sucavu.svg',
    logoLoginPath: '/img/1011/sucavu.svg',
    placeholder: '/img/1010/placeholder.png',
    profileColor: '#3b2f93',
    baseColor: '#292425',
    primaryColor: '#3b2f93',
    secondaryColor: '#3b2f93',
    accentColor: '#33ccbb', // #33ccbb, #3b2f93
    storeUrl: 'https://{slug}.sucavu.com/',
    corporateUrl: 'https://www.sucavu.com/',
    encryptKey: 'sucavu',
    companyTime: 'America/Los_Angeles',
    // social: [
    //   {
    //     key: 'facebook',
    //     url: 'https://www.facebook.com/groups/EverraOfficial/'
    //   }
    // ],
    strings: {
      // stripeConnect: 'Everra Connect'
    },
    agreements: [
      {
        key: 'affiliate',
        name: 'Independent Consultant Agreement',
        url: '/docs/1011/Independent-Consultant-Agreement.pdf'
      },
      {
        key: 'policies',
        name: 'Policies and Procedures',
        url: '/docs/1011/Policies-and-Procedures.pdf'
      }
    ],
    privacyPolicy: '/docs/1011/Privacy-Policy.pdf',
    features: {
      announcements: false,
      sales: true,
      awards: {
        base: false
      },
      team: {
        base: true,
        generations: false,
        activity: true,
        search: true,
        graph: true
      },
      activity: true,
      legal: {
        docs: false,
        ssn: false
      },
      customers: true,
      social: false,
      payouts: true,
      generalDashboard: true,
      files: false,
      assetTags: {
        files: 'search:files'
      },
      dashboard: {
        announcements: true,
        personalCard: true,
        personalCardSocial: true,
        rankRequirements: true,
        teamOverview: true,
        directory: true,
        incentives: [ 'I1010March2020' ]
      }
    }
  }
}

const contents = `
/* eslint-disable */
export default ${JSON.stringify(tenantOptions[tenantId] || tenantOptions[1000])}
`

fs.writeFileSync(path.resolve(__dirname, 'src/tenant.js'), contents)
