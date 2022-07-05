import domtoimage from 'dom-to-image';
import { LIS } from '../../../helpers/lis.js';


export const shareCard = (card_id) => {
    const dd = LIS.id(card_id)
    // dd.style.backgroundColor ="white"
    const scale = 2
    // dd.childNodes[4].remove()
    domtoimage.toBlob(dd, {
      width: dd.clientWidth * scale,
      height: dd.clientHeight * scale,
      bgcolor: 'white',
      filter: function (node) { return (node.tagName !== 'BUTTON') },
      style: {
        transform: 'scale(' + scale + ')',
        transformOrigin: 'top left'
      }
    }).then(function (blob) {
      const file = new File([blob], 'WeatherVenue.png', { type: blob.type })
      const data = {
        title: 'WeatherVenue.com',
        text: `Weather in ${card_id.split('_')[0].split('-')[1]}`,
        files: [file]
      }
      if(navigator.canShare && navigator.canShare(data)) {
        navigator.share(data)
      } else {
        console.log('cannot share ')
      }
    })
  }