# Services

Here we put any processing logic which happens in a request lifecycle:

- `data.js` loads data from disk on bootstrap (or on demand? not really)
- `helper.js` is a collection of used algorithms (self contained, like an algorithm *Quoi!*)
- `mongo.js` our little mongo API
- `Pipeline` like `helpers.js` but more like a `MAIN` function, there are processing pipelines like: `clean(body).removeBadWords('description').validate()`
- `renderer.js` is simply delivers user friendly messages to `reply.view` in `/routes`
- `dictionary.js` is based on Facebook Muse [data](https://github.com/facebookresearch/MUSE/#download) and annoy algorithm to provide word to word approximate translations 
- `mailer.js` is based on Mail-Time to send automated notifications (emails) to users based on there actions

---

## License
<a rel="license" href="http://creativecommons.org/licenses/by-nc/3.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc/3.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc/3.0/">Creative Commons Attribution-NonCommercial 3.0 Unported License</a>.
Attribution-NonCommercial 3.0 Unported (CC BY-NC 3.0)

### Author
Email: bacloud14[at]gmail(dot)com  
Name: A. B.  
2022
