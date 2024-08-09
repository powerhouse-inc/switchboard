import { beforeAll, describe, expect, it } from "vitest";
import { RuntimeCompositeDefinition } from "@composedb/types";
import { KYCService } from "../src/modules/renown/kyc-service";
import { definition } from "../src/modules/renown/ceramic/definition";

describe("KYC Service", () => {

  let service: KYCService;

  beforeAll(async () => {
    service = new KYCService({
      definition: definition as RuntimeCompositeDefinition,
      ceramicUrl: "https://ceramic-ksdc-mainnet.hirenodes.io",
    });
    await service.init();
  });

  it("should get credential", async () => {
    const issuerId = "did:pkh:eip155:1:0x1AD3d72e54Fb0eB46e87F82f77B284FC8a66b16C";
    const subjectId = "did:key:zDnaegvkgCTxHQwNZMh34viXhurJyr3TQyASN76LUgWBgSYbF";
    const credential = await service.getCredential(issuerId, subjectId);
    expect(credential).toEqual({
      "context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://raw.githubusercontent.com/w3c-ccg/ethereum-eip712-signature-2021-spec/main/contexts/v1/index.json",
      ],
      "controller": {
        "id": "did:key:z6MkvEHrsc8GA8iaASbETdAAHoXXCgHSFT9fNSHo8mRUa8j4",
      },
      "credentialSchema": {
        "id": "https://www.powerhouse.inc/renown/credential.jsonld",
        "type": "JsonSchemaValidator2018",
      },
      "credentialSubject": {
        "app": "Connect",
        "id": {
          "id": "did:key:zDnaegvkgCTxHQwNZMh34viXhurJyr3TQyASN76LUgWBgSYbF",
        },
        "name": "",
      },
      "expirationDate": null,
      "id": "kjzl6kcym7w8yacml158c58wdb8yq64xzzw2p0mnltkrmwuuqqp413xsgfe4zfe",
      "issuanceDate": "2024-08-08T07:41:52.529Z",
      "issuer": {
        "id": "did:pkh:eip155:1:0x1AD3d72e54Fb0eB46e87F82f77B284FC8a66b16C",
      },
      "proof": {
        "created": "2024-08-08T07:42:00.674Z",
        "eip712": {
          "domain": {
            "chainId": 1,
            "name": "Renown",
            "version": "0.1",
          },
          "primaryType": "VerifiableCredential",
          "types": {
            "CredentialSchema": [
              {
                "name": "id",
                "type": "string",
              },
              {
                "name": "type",
                "type": "string",
              },
            ],
            "CredentialSubject": [
              {
                "name": "app",
                "type": "string",
              },
              {
                "name": "id",
                "type": "string",
              },
              {
                "name": "name",
                "type": "string",
              },
            ],
            "EIP712Domain": [
              {
                "name": "name",
                "type": "string",
              },
              {
                "name": "version",
                "type": "string",
              },
              {
                "name": "chainId",
                "type": "uint256",
              },
              {
                "name": "verifyingContract",
                "type": "address",
              },
            ],
            "Issuer": [
              {
                "name": "id",
                "type": "string",
              },
              {
                "name": "ethereumAddress",
                "type": "string",
              },
            ],
            "VerifiableCredential": [
              {
                "name": "@context",
                "type": "string[]",
              },
              {
                "name": "type",
                "type": "string[]",
              },
              {
                "name": "id",
                "type": "string",
              },
              {
                "name": "issuer",
                "type": "Issuer",
              },
              {
                "name": "credentialSubject",
                "type": "CredentialSubject",
              },
              {
                "name": "credentialSchema",
                "type": "CredentialSchema",
              },
              {
                "name": "issuanceDate",
                "type": "string",
              },
              {
                "name": "expirationDate",
                "type": "string",
              },
            ],
          },
        },
        "proofPurpose": "assertionMethod",
        // eslint-disable-next-line max-len
        "proofValue": "0x4fa8e7392f123f825958ac3d994221b5f3c6476d848283f82d063668d764cc943c2e863ba45332ae70b324434121a45d9b596cc1a9f2076008763c37cc8c96331c",
        "type": "EthereumEip712Signature2021",
        "verificationMethod": "did:pkh:eip155:1:0x1AD3d72e54Fb0eB46e87F82f77B284FC8a66b16C#ethereumAddress",
      },
      "revocationDate": null,
      "type": [
        "VerifiableCredential",
        "PowerhouseVerifiableCredential",
      ],
    });
  });

  it("should check credential", async () => {
    const credential = {
      issuanceDate: new Date().toISOString(),
      issuer: {
        id: "did:compose:0x123",
      },
      credentialSubject: {
        id: "did:compose:0x456",
      },
    };
    const valid = await service.checkCredential(credential as any);
    expect(valid).toBe(false);
  });

  it("should return null if credential isnt found", async () => {
    const issuerId = "did:compose:0x123";
    const subjectId = "did:compose:0x456";
    const credential = await service.getCredential(issuerId, subjectId)
    expect(credential).toBeNull();
  });
})
