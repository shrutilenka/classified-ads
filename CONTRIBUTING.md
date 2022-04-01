# Classified-ads

**Classified-ads is a listings website, like in news-papers but offering rich input forms, interactive UI, an interactive Map all presented to users with multiple languages and respecting their privacy.**  

🧰 Tech stack
---
[<img src="https://github.com/devicons/devicon/blob/master/icons/javascript/javascript-original.svg" alt="JavaScript logo" width="50" height="50" />](https://www.javascript.com/) 
[<img src="https://github.com/devicons/devicon/blob/master/icons/webpack/webpack-original.svg" alt="Webpack logo" width="50" height="50" />](https://webpack.js.org/)
[<img src="https://github.com/devicons/devicon/blob/master/icons/bootstrap/bootstrap-original.svg" alt="Bootstrap logo" width="50" height="50" />](https://getbootstrap.com/docs/5.0/)
[<img src="https://github.com/devicons/devicon/blob/master/icons/nodejs/nodejs-original.svg" alt="NodeJS logo" width="50" height="50" />](https://nodejs.org/)
[<img src="https://github.com/fastify/graphics/raw/HEAD/fastify-landscape-outlined.svg" alt="Fastify logo" width="50" height="50" />](https://fastify.io/)
[<img src="https://github.com/devicons/devicon/blob/master/icons/mongodb/mongodb-original.svg" alt="MongoDB logo" width="50" height="50" />](https://docs.mongodb.com/drivers/node/current/)

🧰 Front-end JS/CSS
---
[<img src="https://raw.githubusercontent.com/jaredreich/pell/master/images/logo.png" alt="Pell logo" width="50" height="50" />](https://github.com/jaredreich/pell)
[<img src="https://raw.githubusercontent.com/yairEO/tagify/master/docs/readme-header.svg" alt="Tagify" width="50" height="50" />](https://github.com/yairEO/tagify)
[<img src="https://haroen.me/holmes/images/holmes_logo-hover.svg" alt="Holmes" width="50" height="50" />](https://github.com/Haroenv/holmes)
[<img src="https://cdn.worldvectorlogo.com/logos/leaflet-1.svg" alt="Leaflet logo" width="100" height="50" />](https://leafletjs.com/)
[<img src="https://camo.githubusercontent.com/2ad966e7273e5fa36e98a63f6ad2c99e023ac67f0bef3bb8ff3a308a12d219aa/68747470733a2f2f67626c6f627363646e2e676974626f6f6b2e636f6d2f7370616365732532462d4c39695336576d3268796e53354839476a376a2532466176617461722e706e673f616c743d6d65646961" alt="I18n
" width="50" height="50" />](https://github.com/danabr/jsI18n)
[<img src="https://camo.githubusercontent.com/b9f9f0f7f6eba68351d09485a9555ce9ec94195da3e471a6917d26908f40b283/68747470733a2f2f73747265746368792e7665726f752e6d652f6c6f676f2e737667236e6f74657874" alt="Stretchy" width="50" height="50" />](https://github.com/LeaVerou/stretchy)
<p>... and many others</p>


## Functionalities

- Please check README

## Notes

- Please check README

## Deployment


`.env` files hold secret keys and configurations which you want to hide.  
All other configurations should live in `/config/{NODE_env}.json` file.

- Install sass globally
`npm install -g sass`
-  Install webpack globally
`npm install -g webpack`
-  Create environment files
`touch /.env && /client/.env`
-  Fulfill environment variables on server (note that `localhost` is meant for easy deployment on your machine  
while `development` is meant for deployment on cloud providers (tested on Heroku))
   - NODE_ENV=localhost
   - HONEYPOT_KEY=
   - MONGODB_URI=mongodb+srv://### (optional for localhost env)
   - CREDS_PATH=./creds/##.json
   - GCLOUD_STORAGE_BUCKET=
   - JWT_SECRET=
   - COOKIE_NAME=
   - SECRET_PATH=
   -
-  Fulfill environment variables on client
   - NODE_ENV=localhost
   - LATITUDE=
   - LONGITUDE=
   - BORDERS_FILE_URL=
   - STATES_FILE_URL=
   -
-  Generate client public JS/CSS
`npm run prestart`
-  Preapare database
MongoDB must be up with the following dbs and collections  
`DBs: {listings_db_dev, listings_db} & Collections: {listing, words, comment, users, visitors-default-current, visitors-default}`
-  Fulfill Google Cloud credentials (for storage) (optional for localhost env)
`./creds/############.json` 
-  Change environment file accordingly
`touch /.env && /client/.env`
-  Verify configuration on your environments as you want here `/config`

### Note

The app bootstraps for Algeria country as an example, with a simple tweak, you could bootstrap the app on another location with a different map (I encourage you to try that).
For instance, my `/client/.env` is like:

```
LATITUDE=36.75
LONGITUDE=3.05
BORDERS_FILE_URL=https://raw.githubusercontent.com/bacloud14/listings-data/main/data/geo/borders-algeria-v0.json
STATES_FILE_URL=https://raw.githubusercontent.com/bacloud14/listings-data/main/data/geo/states-algeria-v0.json
```
With a center (LATITUDE, LONGITUDE) and a map. Check [here](https://github.com/bacloud22/Classified-ads-xx-data) or elswhere for more geoJson data.

With a different geoJSON data, you might need to change encoders in both files `/data/geo/geoJSONEncoder.js` and `/client/data/geo/geoJSONEncoder.js`.

----

## Finally

- **Contribution is VERY WELCOME, I already thank you in advance. This project needs you, I passed literally a year on this, knowing I'm your average developer, another one would take way less time.**

- **Deploying it elsewhere is fine for non-commercial uses (see license), but please, consider to contribute to this main project pushing everything you find important: a new functionality, a bug or security fix, better design...**

- **I will be very active with pull requests (testing and approving) but less active on resolving raised issue. With this being said, I really appreciate new issues raised after a proper installation and tests.**

- **The app is full of bugs ! I know.**

- **There are dozens of TODOs I leave in code. You can pick one and help the project! Some are left for you to customize depending on your preferences.**


- We rely on dozens of open sources projects particularly for front-end particularly. These are lightweight, minimal and safe libraries. Some examples are: 

  * pell: 📝 the simplest and smallest WYSIWYG text editor for web, with no dependencies [repo](https://github.com/jaredreich/pell)
  * tagify: 🔖 lightweight, efficient Tags input component in Vanilla JS / React / Angular / Vue  [repo](https://github.com/yairEO/tagify)
  * notyf: 👻 A minimalistic, responsive, vanilla JavaScript library to show toast notifications [repo](https://github.com/caroso1222/notyf)
  * holmes: Fast and easy searching inside a page [repo](https://github.com/Haroenv/holmes) It uses microlight also.
  * auto-complete:  An extremely lightweight and powerful vanilla JavaScript completion suggester. [repo](https://github.com/Pixabay/JavaScript-autoComplete)
  * jsi18n: Simple client side internationalization with javascript. [repo](https://github.com/danabr/jsI18n) 
  * avatar: Library for showing Gravatars or generating user avatars. [repo](https://github.com/MatthewCallis/avatar) 
  * FontPicker: Font selector component for Google Fonts . [repo](https://github.com/samuelmeuli/font-picker)
  * stretchy: Form element autosizing, the way it should be. [repo](https://github.com/LeaVerou/stretchy)

    This raises multiple challenges mainly for upgrading and actively maintained from their authors. We would like to rely always on the latest versions but we would change one library by another if the project seems inactive or very old (like not supporting modules or so).
    Leaflet particularly is the most important in this regard.

    I don't know much yet about versionning in npm, although [it is very very important](https://docs.npmjs.com/about-semantic-versioning). I suggest to install [ndm](https://720kb.github.io/ndm/) and add two projects `./` and `./client/` to have an eye on last versions and what to expect.


### Pull requests

- Merging the same code with different indentations is hell, so it is important to keep one coding style between forks. I suggest to install [VSCode ESlint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) (Prettier also) that connects automatically with `./eslintrc.js` and `./client/./eslintrc.js`. 
    - "dbaeumer.vscode-eslint"
    - "esbenp.prettier-vscode"

---

## License
<a rel="license" href="http://creativecommons.org/licenses/by-nc/3.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc/3.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc/3.0/">Creative Commons Attribution-NonCommercial 3.0 Unported License</a>.
Attribution-NonCommercial 3.0 Unported (CC BY-NC 3.0)

### Author
Email: bacloud14[at]gmail(dot)com  
Name: A. B.  
2022