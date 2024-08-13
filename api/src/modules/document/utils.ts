import { Operation, utils } from "document-model/document";
import * as KeyDidResolver from 'key-did-resolver'
import { Resolver } from 'did-resolver'
import crypto from "node:crypto";
import { service } from "../renown/kyc-service";
import { getAddressDID } from "../renown/types";
import logger from "../../logger";

const keyDidResolver = KeyDidResolver.getResolver()
const didResolver = new Resolver(keyDidResolver)


export async function verifyOperationsAndSignature(documentId: string, operations: Operation[]) {
  const results = await Promise.all(operations.map(async (operation: Operation, index: number) => {
    const { DISABLE_SIGNATURE_VERIFICATION } = process.env;
    if (DISABLE_SIGNATURE_VERIFICATION === "true") {
      return true;
    }

    const signer = operation.context?.signer;
    if (!signer) {
      throw new Error('Signer is not defined');
    }

    // check data fields
    // const previousStateHash = operations[index - 1]?.hash ?? "";
    // const genData = utils.buildOperationSignatureParams({ documentId, operation, previousStateHash, signer })
    // const sigData = signer.signatures[0]?.toString().split(",")
    // logger.info(sigData)
    // logger.info(genData)

    // const validData = genData.map((d: string, i: number) => {
    //   // if()
    //   if (!sigData[i] || d !== sigData[i]) {
    //     logger.error(`Data mismatch: ${d} !== ${sigData[i]}`)
    //     return false
    //   }

    //   return true;
    // }).filter(e => !e).length === 0

    // if (!validData) {
    //   return false
    // }

    // check signature
    const algorithm = {
      name: 'ECDSA',
      namedCurve: 'P-256',
      hash: 'SHA-256',
    };

    const verified = await utils.verifyOperationSignature(
      signer.signatures.at(0)!,
      signer,
      async (publicKey, signature, data) => {
        let pubkey: any = publicKey;
        if (publicKey.startsWith("did:key:")) {
          const doc = await didResolver.resolve(publicKey)
          const auth = doc.didDocument?.verificationMethod;
          if (auth && auth[0]) {
            pubkey = auth[0].publicKeyJwk;
          }
        }

        const importedKey = await crypto.subtle.importKey(
          'jwk',
          pubkey,
          algorithm,
          true,
          ['verify'],
        );
        return crypto.subtle.verify(
          algorithm,
          importedKey,
          signature,
          data,
        );


      },
    );
    const issuerId = getAddressDID(signer.user.address, signer.user.chainId);
    const credential = await service.getCredential(issuerId, signer.app.key)

    if (!credential) {
      throw new Error('Credential not found');
    }

    return verified
  }));

  return results.filter(e => !e).length === 0
}
