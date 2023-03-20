export default {
    "scalars": [
        1,
        7
    ],
    "types": {
        "AuthPayload": {
            "token": [
                1
            ],
            "user": [
                5
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
                1
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
        "Mutation": {
            "signIn": [
                0,
                {
                    "user": [
                        6,
                        "UserNamePass!"
                    ]
                }
            ],
            "signUp": [
                0,
                {
                    "user": [
                        6,
                        "UserNamePass!"
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
                        1
                    ]
                }
            ],
            "coreUnits": [
                2
            ],
            "me": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "User": {
            "id": [
                1
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
        "UserNamePass": {
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
        "Boolean": {}
    }
}