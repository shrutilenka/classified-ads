# Routes

Here we put routes definitions like:

```js
    fastify.get('/', async function (req, reply) {
        const listings = await QInstance.getDocumentsSince(
            20, '', req.pagination)
        const { page, perPage } = req.pagination
        const data = {
            title: 'Classified-ads',
            context: 'index',
            listings: listings.documents,
            current: page,
            pages: Math.ceil(listings.count / perPage)
            // user: req.body.user,
        }
        reply.blabla([data, 'index', 'listings'])
    })
```
So we construct a result based on a user query. It's like Main for every request.
We do little logic besides routing and delivering messages to users.
We delegate:
- `/decorators` for long handlers
- `/constraints` for logical rules (validation, configuration)... 
- `../services` for other logics and processing