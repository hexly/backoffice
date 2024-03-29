import gql from 'graphql-tag'

export const IPAYOUTS_USER_QUERY = gql`
query userQuery($input: PayoutsUserInput) {
  payoutsUserQuery(input: $input) {
    PayoutsUserDetails {
      userName: String,
      customerGUID: String,
      isActivated: Boolean,
      email: String,
      firstName: String,
      lastName: String,
      companyName: String,
      phone: String,
      cellPhoneNumber: String,
      eWalletID: String,
      address1: String,
      address2: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
      dateOfBirth: String,
      isSuspended: Boolean,
      isInfoVerified: Boolean,
      isClosed: Boolean,
      createdDate: String,
      isAgreedToFees: Boolean,
      isBusiness: Boolean,
      isValidEmail: Boolean,
      preferredLanguage: String,
      svcShippingAddress: String,
      m_code: Int,
      m_text: String,
      logTransactionId: Int,
      transactionRefId: Int,
      achTransactionId: Int,
      processorTransactionRefNumber: Int,
      customerFeeAmount: Float,
      currencyCode: String
    }
  }
}
`

export const IPAYOUTS_USER_BALANCE = gql`
query userBalance($input: PayoutsUserInput) {
  payoutsUserBalance(input: $input) {
    balance
    currencyCode
  }
}
`

export const IPAYOUTS_USER_AUTO_LOGIN = gql`
mutation autoLoginUser($input: PayoutsUserInput) {
  payoutsAutoLoginUser(input: $input) {
    url
  }
}
`
