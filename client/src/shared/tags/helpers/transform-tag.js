// eslint-disable-next-line max-len
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ TAGIFY @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

// The DOM element you wish to replace with Tagify
import { stringToColor } from '../../maps/create-maps/helpers/string-to-color.js'
import { lightenDarkenColor } from './colors/lighten-color.js'

/**
 *
 * @param {@@} tagData
 */
export function transformTag(tagData) {
    tagData.style = '--tag-bg:' + lightenDarkenColor(stringToColor(tagData.value), 30)
}
