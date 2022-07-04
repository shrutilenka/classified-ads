import InApp from 'detect-inapp'
const inapp = new InApp(navigator.userAgent || navigator.vendor || window.opera)
export default inapp.isMobile
