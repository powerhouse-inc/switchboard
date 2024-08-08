import { Operation, utils } from "document-model/document";
import fetch from "node-fetch";

export async function verifyOperationsAndSignature(operations: Operation[]) {
  const results = await Promise.all(operations.map(async (operation) => {
    const signer = operation.context?.signer;
    if (!signer) {
      throw new Error('Signer is not defined');
    }

    const algorithm = {
      name: 'ECDSA',
      namedCurve: 'P-256',
      hash: 'SHA-256',
    };

    const verified = await utils.verifyOperationSignature(
      signer.signatures.at(0)!,
      signer,
      async (publicKey, signature, data) => {
        const importedKey = await crypto.subtle.importKey(
          'raw',
          utils.hex2ab(publicKey),
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

    const data = await fetch(
      // eslint-disable-next-line max-len
      `https://renown.id/api/auth/credential?address=${signer.user.address}&chainId=${signer.user.chainId}&app=${signer.app.key}`
    );

    const credential = await data.json();

    if (!credential) {
      throw new Error('Credential not found');
    }

    return verified
  }));

  return results.filter(e => !e).length === 0
}
