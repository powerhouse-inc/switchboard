export const definition = {"models":{"VCEIP712Proof":{"interface":true,"implements":["kjzl6hvfrbw6c8n99cwexrh72412q9suc3boqp1jy4j8rlosa2txugr6l5o4jw8"],"id":"kjzl6hvfrbw6c6f0hl3vk6f7qazcv9wim7dhapdpf5smqamwf0kn3f71vp3phrg","accountRelation":{"type":"none"}},"VerifiableCredential":{"interface":true,"implements":[],"id":"kjzl6hvfrbw6c8n99cwexrh72412q9suc3boqp1jy4j8rlosa2txugr6l5o4jw8","accountRelation":{"type":"none"}},"VerifiableCredentialEIP712":{"interface":false,"implements":["kjzl6hvfrbw6c8n99cwexrh72412q9suc3boqp1jy4j8rlosa2txugr6l5o4jw8","kjzl6hvfrbw6c6f0hl3vk6f7qazcv9wim7dhapdpf5smqamwf0kn3f71vp3phrg"],"id":"kjzl6hvfrbw6caogwvtf6jwcphtgq3sq0yww4ggehd5ue8jowppzokvd6rkg9t6","accountRelation":{"type":"list"}}},"objects":{"CredentialSchema":{"id":{"type":"string","required":true,"immutable":false},"type":{"type":"string","required":true,"immutable":false}},"CredentialStatus":{"id":{"type":"string","required":true,"immutable":false},"type":{"type":"string","required":true,"immutable":false}},"CredentialSubject":{"id":{"type":"did","required":true,"immutable":false},"app":{"type":"string","required":true,"immutable":false},"name":{"type":"string","required":false,"immutable":false}},"Domain":{"name":{"type":"string","required":true,"immutable":false},"chainId":{"type":"integer","required":true,"immutable":false},"version":{"type":"string","required":true,"immutable":false}},"EIP712":{"types":{"type":"reference","refType":"object","refName":"ProofTypes","required":true,"immutable":false},"domain":{"type":"reference","refType":"object","refName":"Domain","required":true,"immutable":false},"primaryType":{"type":"string","required":true,"immutable":false}},"Issuer":{"id":{"type":"string","required":true,"immutable":false},"ethereumAddress":{"type":"string","required":false,"immutable":false}},"ProofEIP712":{"type":{"type":"string","required":true,"immutable":false},"eip712":{"type":"reference","refType":"object","refName":"EIP712","required":true,"immutable":false},"created":{"type":"datetime","required":true,"immutable":false},"proofValue":{"type":"string","required":true,"immutable":false},"proofPurpose":{"type":"string","required":true,"immutable":false},"verificationMethod":{"type":"string","required":true,"immutable":false}},"ProofTypes":{"Issuer":{"type":"list","required":true,"immutable":false,"item":{"type":"reference","refType":"object","refName":"Types","required":true,"immutable":false}},"EIP712Domain":{"type":"list","required":true,"immutable":false,"item":{"type":"reference","refType":"object","refName":"Types","required":true,"immutable":false}},"CredentialSchema":{"type":"list","required":true,"immutable":false,"item":{"type":"reference","refType":"object","refName":"Types","required":true,"immutable":false}},"CredentialSubject":{"type":"list","required":true,"immutable":false,"item":{"type":"reference","refType":"object","refName":"Types","required":true,"immutable":false}},"VerifiableCredential":{"type":"list","required":true,"immutable":false,"item":{"type":"reference","refType":"object","refName":"Types","required":true,"immutable":false}}},"Types":{"name":{"type":"string","required":true,"immutable":false},"type":{"type":"string","required":true,"immutable":false}},"VCEIP712Proof":{"type":{"type":"list","required":true,"immutable":false,"item":{"type":"string","required":true,"immutable":false}},"proof":{"type":"reference","refType":"object","refName":"ProofEIP712","required":true,"immutable":false},"issuer":{"type":"reference","refType":"object","refName":"Issuer","required":true,"immutable":false},"context":{"type":"list","required":true,"immutable":false,"item":{"type":"string","required":true,"immutable":false}},"issuanceDate":{"type":"datetime","required":true,"immutable":false},"expirationDate":{"type":"datetime","required":false,"immutable":false},"credentialSchema":{"type":"reference","refType":"object","refName":"CredentialSchema","required":true,"immutable":false},"credentialStatus":{"type":"reference","refType":"object","refName":"CredentialStatus","required":false,"immutable":false},"controller":{"type":"view","viewType":"documentAccount"}},"VerifiableCredential":{"type":{"type":"list","required":true,"immutable":false,"item":{"type":"string","required":true,"immutable":false}},"issuer":{"type":"reference","refType":"object","refName":"Issuer","required":true,"immutable":false},"context":{"type":"list","required":true,"immutable":false,"item":{"type":"string","required":true,"immutable":false}},"issuanceDate":{"type":"datetime","required":true,"immutable":false},"expirationDate":{"type":"datetime","required":false,"immutable":false},"credentialSchema":{"type":"reference","refType":"object","refName":"CredentialSchema","required":true,"immutable":false},"credentialStatus":{"type":"reference","refType":"object","refName":"CredentialStatus","required":false,"immutable":false},"controller":{"type":"view","viewType":"documentAccount"}},"VerifiableCredentialEIP712":{"type":{"type":"list","required":true,"immutable":false,"item":{"type":"string","required":true,"immutable":false}},"proof":{"type":"reference","refType":"object","refName":"ProofEIP712","required":true,"immutable":false},"issuer":{"type":"reference","refType":"object","refName":"Issuer","required":true,"immutable":false},"context":{"type":"list","required":true,"immutable":false,"item":{"type":"string","required":true,"immutable":false}},"issuerId":{"type":"string","required":true,"immutable":false,"indexed":true},"subjectId":{"type":"did","required":true,"immutable":false,"indexed":true},"issuanceDate":{"type":"datetime","required":true,"immutable":false,"indexed":true},"expirationDate":{"type":"datetime","required":false,"immutable":false,"indexed":true},"revocationDate":{"type":"datetime","required":false,"immutable":false,"indexed":true},"credentialSchema":{"type":"reference","refType":"object","refName":"CredentialSchema","required":true,"immutable":false},"credentialStatus":{"type":"reference","refType":"object","refName":"CredentialStatus","required":false,"immutable":false},"credentialSubject":{"type":"reference","refType":"object","refName":"CredentialSubject","required":true,"immutable":false},"controller":{"type":"view","viewType":"documentAccount"}}},"enums":{},"accountData":{"vceip712ProofList":{"type":"connection","name":"VCEIP712Proof"},"verifiableCredentialEip712List":{"type":"connection","name":"VerifiableCredentialEIP712"},"verifiableCredentialList":{"type":"connection","name":"VerifiableCredential"}}}
