// currentObj is an instance of CurrentList
// map, currentMarked, markers, autocomplete, language, and directions are all global variables holding one value,
// that could change with a new city search or other user interactions
let currObj = { isValid: false }
let currentMarked
let map
let markers = []
let autocomplete
let language = 'en'
let directions = { start_location: undefined, end_location: undefined }

// callbacks control
let last = new Date().getTime()
let first = true
let center = { lat: -33.8688, lng: 151.2195 }