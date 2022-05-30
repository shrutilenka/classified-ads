// import { LIS } from '../../helpers/lis.js'
import mixitup from 'mixitup'
const __context__ = window.__context__

export const setupMixitup = () => {
    if (__context__ === 'listings' || __context__ === 'geolocation' || __context__ === 'gwoogl') {
        mixitup('.mixitup_container', {
            animation: {
                enable: true,
                effects: 'fade',
                easing: 'ease-in-out',
                duration: 300,
            },
        })
    }
}
