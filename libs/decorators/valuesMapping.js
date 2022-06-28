// A pre-validation helper particularly for user POST requests


function inputsValueMapping(request, reply, done) {
    // This hook will always be executed after the shared `preValidation` hooks
    if (request.method === 'GET' || !request.body) {
        done()
        return
    }
    // TODO: check constraints per route
    let inputs = []
    if(request.url.indexOf('gwoogl') > -1)
        inputs = ['exact']

    if(inputs.length === 0) {
        done()
        return
    }
    // do some mapping
    const keyValues = Object.keys(request.body).map((key) => {
        // RULE 1: remove keys with empty string
        if (request.body[key] == '') {
            return
        }
        // RULE 2: map { on: true, off: false }
        // console.log('inputsValueMapping')
        // console.log(key)
        if (inputs.indexOf(key) > -1) {
            // console.log(request.body[key])
            const isTrue = request.body[key] == 'on' ? true : false
            return [key, isTrue]
        } else {
            return [key, request.body[key]]
        }
    }).filter(Boolean)
    const dictionary = Object.fromEntries(keyValues)
    request.body = dictionary
    done()
}

export default inputsValueMapping
