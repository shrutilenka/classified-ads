// A pre-validation helper particularly for user POST requests

function preValidation(request, reply, done) {
    // This hook will always be executed after the shared `preValidation` hooks
    request.body = Object.fromEntries(
        // request.body[key].value ???????
        Object.keys(request.body)
            .map((key) => {
                // RULE 1: remove keys with empty string
                if (request.body[key] == '') {
                    return
                }
                // RULE 2: map { on: true, off: false }
                if (key === 'exact') {
                    const isTrue = request.body[key] == 'on' ? true : false
                    return [key, isTrue]
                } else {
                    return [key, request.body[key]]
                }
            })
            .filter(Boolean),
    ) // Request body in key-value pairs, like req.body in Express (Node 12+)
    done()
}

module.exports = preValidation
