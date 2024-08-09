export const fetchEntry = `query VerifiableCredentialEIP712($input: VerifiableCredentialEIP712FiltersInput!) {
  verifiableCredentialEIP712Index(first: 1, sorting: { issuanceDate: DESC }, filters: $input) {
    edges {
      node {
        id
        controller {
          id
        }
        issuer {
          id
        }
        context
        type
        credentialSchema {
          id
          type
        }
        credentialSubject {
          id {
            id
          }
          app
          name
        }
        issuanceDate
        expirationDate
        revocationDate
        proof {
          verificationMethod
          created
          proofPurpose
          type
          proofValue
          eip712 {
            domain {
              chainId
              name
              version
            }
            types {
              EIP712Domain {
                name
                type
              }
              CredentialSchema {
                name
                type
              }
              CredentialSubject {
                name
                type
              }
              Issuer {
                name
                type
              }
              VerifiableCredential {
                name
                type
              }
            }
            primaryType
          }
        }
      }
    }
  }
}`;

export const fetchEntries = `query VerifiableCredentialEIP712($first: Int, $input: VerifiableCredentialEIP712FiltersInput!) {
  verifiableCredentialEIP712Index(first: $first, sorting: { issuanceDate: DESC }, filters: $input) {
    edges {
      node {
        id
        controller {
          id
        }
        issuer {
          id
        }
        context
        type
        credentialSchema {
          id
          type
        }
        credentialSubject {
          id {
            id
          }
          app
          name
        }
        issuanceDate
        expirationDate
        revocationDate
        proof {
          verificationMethod
          created
          proofPurpose
          type
          proofValue
          eip712 {
            domain {
              chainId
              name
              version
            }
            types {
              EIP712Domain {
                name
                type
              }
              CredentialSchema {
                name
                type
              }
              CredentialSubject {
                name
                type
              }
              Issuer {
                name
                type
              }
              VerifiableCredential {
                name
                type
              }
            }
            primaryType
          }
        }
      }
    }
  }
}`;
