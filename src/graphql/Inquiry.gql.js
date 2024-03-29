import gql from 'graphql-tag'

export const GET_INQUIRY_RESPONSE = gql`
  query inquiryResponse($input: CommunicationsInquiryResponseByIdInput!) {
    communications {
      inquiryResponse(input: $input) {
        id
        status
        sessionToken
        metadata
        answers {
          id
          question {
            id
            status
            type
            dataType
            name
            atomicName
            label
            ordinal
            required
            allowOtherResponse
            metadata
            isSensitive
            isPii
          }
          value
          optionId
          option
        }
      }
    }
  }
`

export const UPDATE_INQUIRY_RESPONSE = gql`
  mutation commsUpdate($input:CommunicationsInquiryResponseStatusInput!){
    communications {
      inquiryResponseStatus(input:$input){
        id
        inquiry {
          id
        }
      }
    }
  }
`
