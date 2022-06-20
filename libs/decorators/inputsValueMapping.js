// A pre-validation helper particularly for user POST requests

const checkboxes = ['exact', 'offer']
function inputsValueMapping(request, reply, done) {
    // This hook will always be executed after the shared `preValidation` hooks
    if (request.method === 'GET' || !request.body) {
        done()
        return
    }
    // do some mapping
    const keyValues = Object.keys(request.body)
        .map((key) => {
            // RULE 1: remove keys with empty string
            // if (request.body[key] == '') {
            //     return
            // }
            // RULE 2: map { on: true, off: false }
            if (checkboxes.indexOf(key) > -1) {
                const isTrue = request.body[key] == 'on' ? true : false
                return [key, isTrue]
            } else {
                return [key, request.body[key]]
            }
        })
        .filter(Boolean)
    request.body = Object.fromEntries(keyValues) // Request body in key-value pairs, like req.body in Express (Node 12+)
    done()
}

export default inputsValueMapping
