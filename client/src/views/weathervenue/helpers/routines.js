/* eslint-disable no-unused-vars */

import { LIS } from "../../../helpers/lis.js"
import { state } from "../state.js"

const ops = {}
const conf = {}

function __class (cls) { return document.getElementsByClassName(cls) }

const _myStorage = window.localStorage

let collapseBtn1 = LIS.id('collapse1')
collapseBtn1.onclick = function () { collapseBtn1.classList.toggle('active') }
let collapseBtn2 = LIS.id('collapse2')
collapseBtn2.onclick = function () { collapseBtn2.classList.toggle('active') }

// less styling, setting business positions off and transit off
conf['styles'] = {
  default: [],
  hide: [
    {
      featureType: 'poi.business',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'transit',
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [
        { visibility: 'off' }
      ]
    }
  ],
  night: [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#263c3f' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#6b9a76' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#38414e' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#212a37' }]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9ca5b3' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#746855' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#1f2835' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#f3d19c' }]
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#2f3948' }]
    },
    {
      featureType: 'transit.station',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#17263c' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#515c6d' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#17263c' }]
    },
    {
      featureType: 'poi.business',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'transit',
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }]
    }
  ]
}
// Copyright of PimpTrizkit taken from https://github.com/PimpTrizkit/PJs/wiki/12.-Shade,-Blend-and-Convert-a-Web-Color-(pSBC.js)
// Version 4.0
ops['pSBC'] = (p, c0, c1, l) => {
  let r, g, b, P, f, t, h, i = parseInt, m = Math.round, a = typeof (c1) == 'string'
  if (typeof (p) != 'number' || p < -1 || p > 1 || typeof (c0) != 'string' || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a)) return null
  if (!this.pSBCr) this.pSBCr = (d) => {
    let n = d.length, x = {}
    if (n > 9) {
      [r, g, b, a] = d = d.split(','), n = d.length
      if (n < 3 || n > 4) return null
      x.r = i(r[3] == 'a' ? r.slice(5) : r.slice(4)), x.g = i(g), x.b = i(b), x.a = a ? parseFloat(a) : -1
    } else {
      if (n == 8 || n == 6 || n < 4) return null
      if (n < 6) d = '#' + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : '')
      d = i(d.slice(1), 16)
      if (n == 9 || n == 5) x.r = d >> 24 & 255, x.g = d >> 16 & 255, x.b = d >> 8 & 255, x.a = m((d & 255) / 0.255) / 1000
      else x.r = d >> 16, x.g = d >> 8 & 255, x.b = d & 255, x.a = -1
    } return x
  }
  h = c0.length > 9, h = a ? c1.length > 9 ? true : c1 == 'c' ? !h : false : h, f = this.pSBCr(c0), P = p < 0, t = c1 && c1 != 'c' ? this.pSBCr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 }, p = P ? p * -1 : p, P = 1 - p
  if (!f || !t) return null
  if (l) r = m(P * f.r + p * t.r), g = m(P * f.g + p * t.g), b = m(P * f.b + p * t.b)
  else r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5), g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5), b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5)
  a = f.a, t = t.a, f = a >= 0 || t >= 0, a = f ? a < 0 ? t : t < 0 ? a : a * P + t * p : 0
  if (h) return 'rgb' + (f ? 'a(' : '(') + r + ',' + g + ',' + b + (f ? ',' + m(a * 1000) / 1000 : '') + ')'
  else return '#' + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2)
}

var cardsColors
ops['styleItDark'] = () => {
  document.documentElement.style.backgroundColor = '#111'
  state.map.setOptions({ styles: conf['styles'].night })
  LIS.id('copyright_google').src = './copyright/powered_by_google_on_non_white_hdpi.png'
  if (!cardsColors) {
    cardsColors = Array.from(__class('card')).map(card => { return card.style.backgroundColor })
    cardsColors = [...cardsColors]
  }

  Array.from(__class('card')).forEach(card => {
    card.style.backgroundColor = ops['pSBC'](-0.2, card.style.backgroundColor)
  })

  LIS.id('logo').src = './img/weather_venue_856-8_on_black.png'
}

ops['styleItWhite'] = () => {
  document.documentElement.style.backgroundColor = '#eee'
  state.map.setOptions({ styles: conf['styles'].hide })
  LIS.id('copyright_google').src = './copyright/powered_by_google_on_white_hdpi.png'
  if (cardsColors) {
    Array.from(__class('card')).forEach(function (card, idx) {
      card.style.backgroundColor = cardsColors[idx]
    })
  }
  LIS.id('logo').src = './img/weather_venue_856-8.png'
}

ops['showLoading'] = () => {
  LIS.id('spinner-back').classList.add('show')
  LIS.id('spinner-front').classList.add('show')
}

ops['hideLoading'] = () => {
  LIS.id('spinner-back').classList.remove('show')
  LIS.id('spinner-front').classList.remove('show')
}

ops['setWithExpiry'] = (key, value) => {
  const now = new Date()
  const day = { day: now.getDay(), month: now.getMonth(), year: now.getFullYear() }

  // `item` is an object which contains the original value
  // as well as today's date
  const item = {
    value: value,
    expiry: day
  }
  _myStorage.setItem(key, JSON.stringify(item))
}

ops['getWithExpiry'] = (key) => {
  const itemStr = _myStorage.getItem(key)
  // if the item doesn't exist, return null
  if (!itemStr) {
    return null
  }
  const item = JSON.parse(itemStr)
  const now = new Date()

  // compare the expiry time of the item with the current time
  if (now.getDay() !== item.expiry.day || now.getMonth() !== item.expiry.month || now.getFullYear() !== item.expiry.year) {
    // If the item generated today, delete the item from storage
    // and return null
    _myStorage.removeItem(key)
    return null
  }
  return item.value
}

LIS.id('themeSwitch').addEventListener('click', function () {
  const isChecked = LIS.id('themeSwitch').checked
  const value = isChecked ? 1 : 0
  value ? localStorage.setItem('themeSwitch', 'true') : localStorage.removeItem('themeSwitch')
  if (!value) {
    document.body.style.backgroundImage = ''
    document.documentElement.style.backgroundImage = ''
  }
})

conf['autocompleteOptions'] = {
  types: ['(cities)']
  // componentRestrictions: {country: "us"}
}

// Toggle cards background color between minimum and maximum hue colors
ops['minMax'] = () => {
  const cards = Array.from(document.querySelectorAll('[id^="checkIdcity"]')).map(a => { return a.firstElementChild }).filter(a => { return a.className === 'card'}).slice(0, 8)
  cards.forEach(card => {
    const style = card.style.backgroundImage
    if (style.indexOf('40%') > -1) {
      LIS.id('minmax').children[0].style = 'color:blue'
      LIS.id('minmax').children[1].style = 'color:black'
      card.style.backgroundImage = style.replace('40%', '100%').replace('40%', '100%')
      Array.from(document.body.getElementsByTagName('th')).slice(0, 176).forEach(th => {
        th.innerHTML = th.innerHTML.replace('ᐁ', '▼')
        th.innerHTML = th.innerHTML.replace('▲', 'ᐃ')
      })
      return
    }
    if (style.indexOf('0.01%') > -1) {
      LIS.id('minmax').children[0].style = 'color:black'
      LIS.id('minmax').children[1].style = 'color:black'
      card.style.backgroundImage = style.replace('0.01%', '40%').replace('0.01%', '40%')
      Array.from(document.body.getElementsByTagName('th')).slice(0, 176).forEach(th => {
        th.innerHTML = th.innerHTML.replace('▼', 'ᐁ')
        th.innerHTML = th.innerHTML.replace('▲', 'ᐃ')
      })
      return
    }
    if (style.indexOf('100%') > -1) {
      LIS.id('minmax').children[0].style = 'color:black'
      LIS.id('minmax').children[1].style = 'color:red'
      card.style.backgroundImage = style.replace('100%', '0.01%').replace('100%', '0.01%')
      Array.from(document.body.getElementsByTagName('th')).slice(0, 176).forEach(th => {
        th.innerHTML = th.innerHTML.replace('▼', 'ᐁ')
        th.innerHTML = th.innerHTML.replace('ᐃ', '▲')
      })
    }
  })
}

// Comparison
ops['allowDrop'] = (ev) => {
  ev.preventDefault()
}

ops['drag'] = (ev) => {
  ev.dataTransfer.setData('text', ev.target.id)
}

ops['drop'] = (ev) => {
  ev.preventDefault()
  const data = ev.dataTransfer.getData('text')
  const toBe = generateCard(data)
  ev.target.appendChild(toBe)
}

ops['autoDrag'] = (autoDragId) => {
  LIS.id(autoDragId).remove()
  const data = autoDragId.slice(0, -9)
  const toBe = generateCard(data)
  toBe.childNodes[4].remove()
  LIS.id('comparision-items').appendChild(toBe)
  window.location = '#comparision-items'
}

ops['emptyIt'] = () => {
  const elements = document.querySelectorAll('[id*="_clone"]')
  Array.prototype.forEach.call(elements, function(node) {
    node.parentNode.removeChild(node)
  })
}

export { ops, conf }

/**
 * Copyright (c) Christopher Keefer, 2016.
 * https://github.com/SaneMethod/fetchCache
 *
 * Override fetch in the global context to allow us to cache the response to fetch in a Storage interface
 * implementing object (such as localStorage).
 */
(function (fetch) {
  /* If the context doesn't support fetch, we won't attempt to patch in our
   caching using fetch, for obvious reasons. */
  if (!fetch) return

  /**
   * Generate the cache key under which to store the local data - either the cache key supplied,
   * or one generated from the url, the Content-type header (if specified) and the body (if specified).
   *
   * @returns {string}
   */
  function genCacheKey(url, settings) {
    var {headers:{'Content-type': type}} = ('headers' in settings) ? settings : {headers: {}},
      {body} = settings

    return settings.cacheKey || url + (type || '') + (body || '')
  }

  /**
   * Determine whether we're using localStorage or, if the user has specified something other than a boolean
   * value for options.localCache, whether the value appears to satisfy the plugin's requirements.
   * Otherwise, throw a new TypeError indicating what type of value we expect.
   *
   * @param {boolean|object} storage
   * @returns {boolean|object}
   */
  function getStorage(storage) {
    if (!storage) return false
    if (storage === true) return self.localStorage
    if (typeof storage === 'object' && 'getItem' in storage &&
          'removeItem' in storage && 'setItem' in storage) {
      return storage
    }
    throw new TypeError('localCache must either be a boolean value, ' +
          'or an object which implements the Storage interface.')
  }

  /**
   * Remove the item specified by cacheKey and its attendant meta items from storage.
   *
   * @param {Storage|object} storage
   * @param {string} cacheKey
   */
  function removeFromStorage(storage, cacheKey) {
    storage.removeItem(cacheKey)
    storage.removeItem(cacheKey + 'cachettl')
    storage.removeItem(cacheKey + 'dataType')
  }

  /**
   * Cache the response into our storage object.
   * We clone the response so that we can drain the stream without making it
   * unavailable to future handlers.
   *
   * @param {string} cacheKey Key under which to cache the data string. Bound in
   * fetch override.
   * @param {Storage} storage Object implementing Storage interface to store cached data
   * (text or json exclusively) in. Bound in fetch override.
   * @param {Number} hourstl Number of hours this value shoud remain in the cache.
   * Bound in fetch override.
   * @param {Response} response
   */
  function cacheResponse(cacheKey, storage, hourstl, response) {
    var cres = response.clone(),
      dataType = (response.headers.get('Content-Type') || 'text/plain').toLowerCase()

    cres.text().then((text) => {
      try {
        storage.setItem(cacheKey, text)
        storage.setItem(cacheKey + 'cachettl', +new Date() + 1000 * 60 * 60 * hourstl)
        storage.setItem(cacheKey + 'dataType', dataType)
      } catch (e) {
        // Remove any incomplete data that may have been saved before the exception was caught
        removeFromStorage(storage, cacheKey)
        console.log('Cache Error: ' + e, cacheKey, text)
      }
    })

    return response
  }

  /**
   * Create a new response containing the cached value, and return a promise
   * that resolves with this response.
   *
   * @param value
   * @param dataType
   * @returns {Promise}
   */
  function provideResponse(value, dataType) {
    var response = new Response(
      value,
      {
        status: 200,
        statusText: 'success',
        headers: {
          'Content-Type': dataType
        }
      }
    )

    return new Promise(function (resolve, reject) {
      resolve(response)
    })
  }

  /**
   * Override fetch on the global context, so that we can intercept
   * fetch calls and respond with locally cached content, if available.
   * New parameters available on the call to fetch:
   * localCache   : true // required - either a boolean (if true, localStorage is used,
   * if false request is not cached or returned from cache), or an object implementing the
   * Storage interface, in which case that object is used instead.
   * cacheTTL     : 5, // optional, cache time in hours, default is 5. Use float numbers for
   * values less than a full hour (e.g. 0.5 for 1/2 hour).
   * cacheKey     : 'post', // optional - key under which cached string will be stored.
   * isCacheValid : function  // optional - return true for valid, false for invalid.
   */
  self.fetch = function (url, settings) {
    var storage = getStorage(settings.localCache),
      hourstl = settings.cacheTTL || 5,
      cacheKey = genCacheKey(url, settings),
      cacheValid = settings.isCacheValid,
      ttl,
      value,
      dataType

    if (!storage) return fetch(url, settings)

    ttl = storage.getItem(cacheKey + 'cachettl')

    if (cacheValid && typeof cacheValid === 'function' && !cacheValid()) {
      removeFromStorage(storage, cacheKey)
      ttl = 0
    }

    if (ttl && ttl < +new Date()) {
      removeFromStorage(storage, cacheKey)
    }

    value = storage.getItem(cacheKey)

    if (!value) {
      /* If not cached, we'll make the request and add a then block to the resulting promise,
           in which we'll cache the result. */
      return fetch(url, settings).then(cacheResponse.bind(null, cacheKey, storage, hourstl))
    }

    /* Value is cached, so we'll simply create and respond with a promise of our own,
       and provide a response object. */
    dataType = storage.getItem(cacheKey + 'dataType') || 'text/plain'
    return provideResponse(value, dataType)
  };
})(self.fetch)
