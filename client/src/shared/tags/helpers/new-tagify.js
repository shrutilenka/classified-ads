import Tagify from '@yaireo/tagify'
import { transformTag } from './transform-tag.js'
// consts.js' is not under 'rootDir' but whatever
// import { TAG_SIZE } from '../../../../../consts.js'
// TODO: use config variables
const TAG_SIZE = 35
/**
 * @param tagified
 * @param input
 * @param {array} tags of some language
 * @param maxTags
 */
export function newTagify(tagified, input, tags, maxTags = 3) {
    if (tagified) {
        tagified.destroy()
    }
    tagified = new Tagify(input, {
        // limit text size to 35
        pattern: new RegExp(`^.{0,${TAG_SIZE}}$`),
        delimiters: ',| ',
        keepInvalidTags: false,
        editTags: {
            clicks: 1, // single click to edit a tag
            keepInvalid: true, // if after editing, tag is invalid, auto-revert
        },
        maxTags,
        whitelist: tags,
        transformTag: transformTag,
        // originalInputValueFormat: valuesArr => `[${valuesArr.map(item => item.value).join(',')}]`,
        backspace: 'edit',
        placeholder: 'Type something',
        dropdown: {
            enabled: 1,
            fuzzySearch: true,
            position: 'text',
            caseSensitive: true,
        },
        templates: {
            dropdownItemNoMatch: function (data) {
                return `No suggestion found for: ${data.value}`
            },
        },
    })
    return tagified
}
