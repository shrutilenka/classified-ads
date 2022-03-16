// Define the modal (for the image onclick) behaviour
import { LIS } from '../../helpers/lis'

export const setupFavourites = async () => {
  return new Promise(function (resolve, reject) {
    if (!document.querySelector('.CA-listings')) {
      return resolve('### function "setupFavourites" ignored well')
    }
    try {
      // get favorites from local storage or empty array
      var favorites = JSON.parse(localStorage.getItem('favorites')) || []
      // add class 'favourites' to each favorite
      favorites.forEach(function (favorite) {
        const elem = LIS.id(favorite)
        if (elem) {
          elem.className = 'CA-listing favourites'
        }
      })
      // register click event listener
      document.querySelector('.CA-listings').addEventListener('click', function (e) {
        var id = e.target.id,
          item = e.target,
          index = favorites.indexOf(id)
        // return if target doesn't have an id (shouldn't happen)
        if (!id) return
        // item is not favorite
        if (index == -1) {
          favorites.push(id)
          item.className = 'CA-listing favourites'
          // item is already favorite
        } else {
          favorites.splice(index, 1)
          item.className = 'CA-listing'
        }
        // store array in local storage
        localStorage.setItem('favorites', JSON.stringify(favorites))
      })
      // local storage stores strings so we use JSON to stringify for storage and parse to get out of storage
      return resolve('### function "setupFavourites" run successfully')
    } catch (error) {
      console.log(
        error.message
      )
      return reject(new Error('### function "setupFavourites" failed'))
    }
  })
}
