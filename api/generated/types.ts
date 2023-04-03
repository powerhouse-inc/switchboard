export default {
    "scalars": [
        1,
        3,
        4,
        8,
        10
    ],
    "types": {
        "AuthPayload": {
            "session": [
                7
            ],
            "token": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "String": {},
        "CoreUnit": {
            "code": [
                1
            ],
            "descriptionParagraph": [
                1
            ],
            "descriptionParagraphImageSource": [
                1
            ],
            "descriptionSentence": [
                1
            ],
            "id": [
                3
            ],
            "imageSource": [
                1
            ],
            "name": [
                1
            ],
            "shortCode": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "DateTime": {},
        "Mutation": {
            "createSession": [
                11,
                {
                    "session": [
                        9,
                        "SessionCreateInput!"
                    ]
                }
            ],
            "revokeSession": [
                7,
                {
                    "sessionId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "signIn": [
                0,
                {
                    "user": [
                        13,
                        "UserNamePassInput!"
                    ]
                }
            ],
            "signUp": [
                0,
                {
                    "user": [
                        13,
                        "UserNamePassInput!"
                    ]
                }
            ],
            "__typename": [
                1
            ]
        },
        "Query": {
            "coreUnit": [
                2,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "coreUnits": [
                2
            ],
            "me": [
                12
            ],
            "sessions": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "Session": {
            "createdAt": [
                4
            ],
            "createdBy": [
                1
            ],
            "id": [
                3
            ],
            "isUserCreated": [
                8
            ],
            "name": [
                1
            ],
            "referenceExpiryDate": [
                4
            ],
            "referenceTokenId": [
                1
            ],
            "revokedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {},
        "SessionCreateInput": {
            "expiryDurationSeconds": [
                10
            ],
            "name": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Int": {},
        "SessionCreateOutput": {
            "session": [
                7
            ],
            "token": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "User": {
            "id": [
                3
            ],
            "password": [
                1
            ],
            "username": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UserNamePassInput": {
            "password": [
                1
            ],
            "username": [
                1
            ],
            "__typename": [
                1
            ]
        }
    }
}