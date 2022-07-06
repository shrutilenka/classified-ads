import axios from 'axios'
let listings = []
axios
    .get(
        'https://raw.githubusercontent.com/bacloud22/Classified-ads-xx-data/main/data/announcements/fr/announcements.md',
    )
    .then(function (response) {
        // handle success
        let announcements = response.data.split('<hr>')
        announcements.forEach((announcement) => {
            let title = announcement.match(/#.+/g).filter((title) => title.indexOf('##') < 0)[0]
            listings.push({ title, announcement })
        })
    })
    .catch(function (error) {
        // handle error
        console.log(error)
    })
    .then(function () {
        // always executed
    })
