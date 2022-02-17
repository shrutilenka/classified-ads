# Services

Here we put any processing logic which happens in a request lifecycle:

- `data.js` loads data from disk on bootstrap (or on demand? not really)
- `helper.js` is a collection of used algorithms (self contained, like an algorithm *Quoi!*)
- `mongo.js` our little mongo API
- `Pipeline` like `helpers.js` but more like a `MAIN` function, there are processing pipelines like: `clean(body).removeBadWords('description').validate()`
- `renderer.js` is simply delivers user friendly messages to `reply.view` in `/routes`
