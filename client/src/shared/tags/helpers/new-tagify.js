import Tagify from '@yaireo/tagify'
import { consts } from '../../../views/main/consts.js'
import { colorContext } from './transform-tag.js'

const TAG_SIZE = consts.tagSize
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
    if (__context__ === 'all-tags') {
        maxTags = 200
        tags = tags.slice(0, maxTags).filter(Boolean)
        input.value = tags.map(tag => tag.replaceAll(',', '|')).join(',')
    }
    tagified = new Tagify(input, {
        // limit text size to 35
        pattern: new RegExp(`^.{0,${TAG_SIZE}}$`),
        delimiters: ',',
        keepInvalidTags: false,
        editTags: {
            clicks: 1, // single click to edit a tag
            keepInvalid: true, // if after editing, tag is invalid, auto-revert
        },
        maxTags,
        whitelist: tags,
        transformTag: colorContext(__context__),
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
