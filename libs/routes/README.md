# Routes

Here we put routes definitions like:

```js
    fastify.get('/', async function (req, reply) {
        const listings = await QInstance.getListingsSince(
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

---

## License
<a rel="license" href="http://creativecommons.org/licenses/by-nc/3.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc/3.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc/3.0/">Creative Commons Attribution-NonCommercial 3.0 Unported License</a>.
Attribution-NonCommercial 3.0 Unported (CC BY-NC 3.0)

### Author
Email: bacloud14[at]gmail(dot)com  
Name: A. B.  
2022
