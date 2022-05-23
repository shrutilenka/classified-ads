/**
 * This setup Ads
 */
import rotator from 'ad-rotator'
import { LIS } from '../../helpers/lis'

export const setupAdsRotator = async () => {
    return new Promise(function (resolve, reject) {
        if (!LIS.id('footer_ads')) {
            return resolve('### function "setupAdsRotator" ignored well')
        }
        try {
            const instance = rotator(
                LIS.id('footer_ads'), // a DOM element
                [
                    // array of Ads
                    {
                        url: 'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/making_art_759c.svg',
                        img: 'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/making_art_759c.svg',
                    },
                    {
                        url: 'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/user_flow_vr6w.svg',
                        img: 'https://42f2671d685f51e10fc6-b9fcecea3e50b3b59bdc28dead054ebc.ssl.cf5.rackcdn.com/illustrations/user_flow_vr6w.svg',
                        weight: 4,
                    },
                ],
            )
            // start the rotation
            instance.start()
            return resolve('### function "setupAdsRotator" run successfully')
        } catch (error) {
            console.log(error.message)
            return reject(new Error('### function "setupAdsRotator" failed'))
        }
    })
}
