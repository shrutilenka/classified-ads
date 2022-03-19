// Constraints to ease code complexity. These constraints reflect 
// which operations to run on some endpoint on some environment 
const S = require('fluent-json-schema')
const { illustrations, fontFamilies } = require('./hallux.js')
const config = require('config')
const TAG_SIZE = config.get('TAG_SIZE')

const login = S.object()
    .prop('username', S.string().format(S.FORMATS.EMAIL))
    .prop('password', S.string().minLength(3).maxLength(40))
    .required(['username', 'password'])
const loginSchema = {
    body: login,
}

const gwoogl = S.object()
    .prop('title_desc', S.string().minLength(3).maxLength(100))
    .prop('exact', S.boolean().default(false))
    .prop('div_q', S.string().minLength(3).maxLength(40))
    .prop('since', S.string().format(S.FORMATS.DATE))
    .prop('section', S.string().enum(['donations', 'skills']))
    .required(['title_desc', 'section'])
const gwooglSchema = {
    body: gwoogl,
}

const geolocation = S.object()
    .prop('lat', S.number().maximum(90).minimum(-90))
    .prop('lng', S.number().maximum(180).minimum(-180))
    .prop('section', S.string().enum(['donations', 'skills']))
    .required(['lat', 'lng', 'section'])
const geolocationSchema = {
    body: geolocation,
}

const donationsSchema = () => {
    return {
        called: false,
        def: S.object()
            .prop('title', S.string().minLength(10).maxLength(100).required())
            .prop('desc', S.string().minLength(10).maxLength(5000).required())
            .prop('tags', S.array().minItems(1).maxItems(3).items(S.string().minLength(3).maxLength(TAG_SIZE)).required())
            .prop('lat', S.number().maximum(90).minimum(-90))
            .prop('lng', S.number().maximum(180).minimum(-180))
            .prop('div', S.string().minLength(3).maxLength(40))
            .prop('section', S.string().enum(['donations']).required())
            .prop('tagsLang', S.string().enum(['arabic', 'english']))
        // avatar, S.string().required()
    }
}

const skillsSchema = () => {
    return {
        called: false,
        def: S.object()
            .prop('title', S.string().minLength(10).maxLength(100).required())
            .prop('desc', S.string().minLength(10).maxLength(5000).required())
            .prop('tags', S.array().minItems(1).maxItems(3).items(S.string().minLength(3).maxLength(TAG_SIZE)).required())
            .prop('section', S.string().enum(['skills']).required())
            .prop('font', S.string().enum(fontFamilies))
            .prop('illu_q', S.string().minLength(2).maxLength(15).required())
            .prop('undraw', S.string().enum(illustrations))
            .prop('color', S.string().regex(/^[0-9a-f]{3,10}$/i))
            // TODO: properly validate this
            .prop('img_radio', S.string())
            // avatar, S.string().required()
    }
}

const comment = S.object()
    .prop('message', S.string().minLength(20).maxLength(200).required())
const commentSchema = {
    body: comment,
}

const constraints = {
    'localhost': {
        'GET': {
            'login': {
                requiredUXInputs: ['username', 'password']
            },
            'signup': {
                requiredUXInputs: ['username', 'password']
            },
            'queryGeolocation': {
                requiredUXInputs: []
            },
            'queryGwoogl': {
                requiredUXInputs: ['title_desc']
            },
            'skills': {
                requiredUXInputs: ['title', 'desc', 'tags', 'illu_q']
            },
            'donations': {
                requiredUXInputs: ['title', 'desc', 'tags']
            },
            'comment': {
                requiredUXInputs: ['message']
            }
        },
        'POST': {
            'login': {
                schema: loginSchema,
            },
            'queryGeolocation': {
                schema: geolocationSchema,
            },
            'queryGwoogl': {
                schema: gwooglSchema,
            },
            'skills': {
                secured: true,
                upload: true,
                geolocation: false,
                illustrations: true,
                schema: skillsSchema,
            },
            'donations': {
                secured: true,
                upload: true,
                geolocation: true,
                illustrations: false,
                schema: donationsSchema,
            },
            'comment': {
                schema: commentSchema,
            }
        }
    },
    // to change
    'monkey chaos': {
        'GET': {

        },
        'POST': {
            'login': {
                schema: loginSchema
            },
            'queryGeolocation': {
                schema: geolocationSchema
            },
            'queryGwoogl': {
                schema: gwooglSchema
            },
            'skills': {
                secured: true,
                upload: true,
                geolocation: false,
                illustrations: true,
                schema: skillsSchema
            },
            'donations': {
                secured: true,
                upload: true,
                geolocation: true,
                illustrations: false,
                schema: donationsSchema
            },
            'comment': {
                schema: commentSchema
            }
        }
    },
    // to change
    'development': {
        'GET': {
            'login': {
                requiredUXInputs: ['username', 'password']
            },
            'queryGeolocation': {
                requiredUXInputs: []
            },
            'queryGwoogl': {
                requiredUXInputs: ['title_desc']
            },
            'skills': {
                requiredUXInputs: ['title', 'desc', 'tags', 'illu_q']
            },
            'donations': {
                requiredUXInputs: ['title', 'desc', 'tags']
            },
            'comment': {
                requiredUXInputs: ['message']
            }
        },
        'POST': {
            'login': {
                schema: loginSchema,
            },
            'queryGeolocation': {
                schema: geolocationSchema,
            },
            'queryGwoogl': {
                schema: gwooglSchema,
            },
            'skills': {
                secured: true,
                upload: true,
                geolocation: false,
                illustrations: true,
                schema: skillsSchema,
            },
            'donations': {
                secured: true,
                upload: true,
                geolocation: true,
                illustrations: false,
                schema: donationsSchema,
            },
            'comment': {
                schema: commentSchema,
            }
        }
    },
    // to change
    'production': {
        'GET': {
            'login': {
                requiredUXInputs: ['username', 'password']
            },
            'queryGeolocation': {
                requiredUXInputs: []
            },
            'queryGwoogl': {
                requiredUXInputs: ['title_desc']
            },
            'skills': {
                requiredUXInputs: ['title', 'desc', 'tags', 'illu_q']
            },
            'donations': {
                requiredUXInputs: ['title', 'desc', 'tags']
            },
            'comment': {
                requiredUXInputs: ['message']
            }
        },
        'POST': {
            'login': {
                schema: loginSchema,
            },
            'queryGeolocation': {
                schema: geolocationSchema,
            },
            'queryGwoogl': {
                schema: gwooglSchema,
            },
            'skills': {
                secured: true,
                upload: true,
                geolocation: false,
                illustrations: true,
                schema: skillsSchema,
            },
            'donations': {
                secured: true,
                upload: true,
                geolocation: true,
                illustrations: false,
                schema: donationsSchema,
            },
            'comment': {
                schema: commentSchema,
            }
        }
    },
}

module.exports = { constraints };
