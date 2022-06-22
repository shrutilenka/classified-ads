// A pre-validation helper particularly for user POST requests

const checkboxes = ['exact', 'offer']
function inputsValueMapping(request, reply, done) {
    // This hook will always be executed after the shared `preValidation` hooks
    if (request.method === 'GET' || !request.body) {
        done()
        return
    }
    // do some mapping
    const keyValues = Object.keys(request.body).map((key) => {
        // RULE 1: remove keys with empty string
        // if (request.body[key] == '') {
        //     return
        // }
        // RULE 2: map { on: true, off: false }
        console.log(key)
        if (checkboxes.indexOf(key) > -1) {
            console.log(request.body[key])
            const isTrue = request.body[key] == 'on' ? true : false
            return [key, isTrue]
        } else {
            return [key, request.body[key]]
        }
    })
    const dictionary = Object.fromEntries(keyValues)
    checkboxes.forEach((key) => {
        dictionary[key] = dictionary[key] ? dictionary[key] : false
    })
    console.log(dictionary)
    request.body = dictionary
    done()
}

export default inputsValueMapping
