const schema = {
    $schema: 'http://json-schema.org/draft-07/schema',
    $id: 'http://example.com/example.json',
    type: 'object',
    title: 'The root schema',
    description: 'The root schema comprises the entire JSON document.',
    default: {},
    examples: [
        {
            title: 'gqrgqrgergergrege',
            tags: [
                'Dog Supplies'
            ],
            desc: 'sdpogk pokgp okqgp$ kqpofgqgf',
            lat: 36.68339,
            lng: 2.89224,
            section: 'donations',
            pass: 'a7egz7vrl',
            d: false,
            a: true,
            usr: 'you@there.com',
            ara: false
        }
    ],
    required: [
        'title',
        'tags',
        'desc',
        'lat',
        'lng',
        'section',
        'pass',
        'd',
        'a',
        'usr',
        'ara'
    ],
    properties: {
        title: {
            $id: '#/properties/title',
            default: '',
            faker: 'lorem.sentence',
            description: 'Title of a listing. (required) : a small string sentence in English or Arabic. User defined.',
            examples: [
                'gqrgqrgergergrege'
            ],
            title: 'The title schema',
            maxLength: 100,
            minLength: 10,
            type: 'string'
        },
        tags: {
            $id: '#/properties/tags',
            default: [],
            description: 'An explanation about the purpose of this instance.',
            examples: [
                [
                    'Dog Supplies'
                ]
            ],
            title: 'The tags schema',
            maxItems: 3,
            minItems: 1,
            type: 'array',
            additionalItems: true,
            items: {
                $id: '#/properties/tags/items',
                maxItems: 3,
                minItems: 1,
                type: [],
                anyOf: [
                    {
                        $id: '#/properties/tags/items/anyOf/0',
                        default: '',
                        description: 'An explanation about the purpose of this instance.',
                        faker: 'lorem.word',
                        examples: [
                            'Dog Supplies'
                        ],
                        title: 'The first anyOf schema',
                        maxLength: 20,
                        minLength: 3,
                        type: 'string'
                    }
                ]
            }
        },
        desc: {
            $id: '#/properties/desc',
            default: '',
            description: 'An explanation about the purpose of this instance.',
            faker: 'lorem.sentence',
            examples: [
                'sdpogk pokgp okqgp$ kqpofgqgf'
            ],
            title: 'The desc schema',
            maxLength: 3000,
            minLength: 20,
            type: 'string'
        },
        lat: {
            $id: '#/properties/lat',
            type: 'string',
            title: 'The lat schema',
            description: 'An explanation about the purpose of this instance.',
            faker: 'address.latitude',
            examples: [
                '36.68339'
            ]
        },
        lng: {
            $id: '#/properties/lng',
            type: 'string',
            title: 'The lng schema',
            description: 'An explanation about the purpose of this instance.',
            faker: 'address.longitude',
            examples: [
                '2.89224'
            ]
        },
        section: {
            $id: '#/properties/section',
            type: 'string',
            title: 'The section schema',
            description: 'An explanation about the purpose of this instance.',
            default: '',
            examples: [
                'donations'
            ]
        },
        pass: {
            $id: '#/properties/pass',
            type: 'string',
            title: 'The pass schema',
            description: 'An explanation about the purpose of this instance.',
            default: '',
            faker: 'lorem.word',
            examples: [
                'a7egz7vrl'
            ]
        },
        d: {
            $id: '#/properties/d',
            type: 'boolean',
            title: 'The d schema',
            description: 'An explanation about the purpose of this instance.',
            default: false,
            examples: [
                false
            ]
        },
        a: {
            $id: '#/properties/a',
            type: 'boolean',
            title: 'The a schema',
            description: 'An explanation about the purpose of this instance.',
            default: false,
            examples: [
                true
            ]
        },
        usr: {
            $id: '#/properties/usr',
            type: 'string',
            title: 'The usr schema',
            faker: 'internet.email',
            description: 'An explanation about the purpose of this instance.',
            default: '',
            examples: [
                'you@there.com'
            ]
        },
        ara: {
            $id: '#/properties/ara',
            type: 'boolean',
            title: 'The ara schema',
            description: 'An explanation about the purpose of this instance.',
            default: false,
            examples: [
                false
            ]
        }
    },
    additionalProperties: true
}

module.exports = {
    schema
}