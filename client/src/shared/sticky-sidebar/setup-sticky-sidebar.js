// Put here one liners with simple configurations
import StickySidebar from 'sticky-sidebar-v2';

export const setupStickySidebar = async () => {
  return new Promise(function (resolve, reject) {
    if (!document.querySelector('#sidebar')) {
      return resolve('### function "setupStickySidebar" ignored well')
    }
    try {
      var sidebar = new StickySidebar('#sidebar', {
        topSpacing: 60,
        bottomSpacing: 60,
        containerSelector: '.main-content',
        innerWrapperSelector: '.sidebar__inner',
        // disable for small screens
        minWidth: 768
      });
      return resolve('### function "setupStickySidebar" run successfully')
    } catch (error) {
      console.log(
        'Maybe running where there is no sidebar in HTML | ERROR: ',
        error.message
      )
      return reject(new Error('### function "setupStickySidebar" failed'))
    }
  })
}