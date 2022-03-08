
// eslint-disable-next-line max-len
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Sync data @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// Each ID in LIS.id('comments') must be uniq
import { LIS } from '../../helpers/lis';
import { commentsTemplate } from './comments-template';
import { topDivsTemplate } from './top-divs-template';
import { topTagsTemplate } from './top-tags-template';
// renderTopByDiv
// on Index page

// renderTopTags
// on sections pages
export const renderShared = () => {
  if (window.__section__) {
    renderTopTags(window.__section__)
  }
  renderTopByDiv()
  renderComments()
}

function renderComments() {
  const comments = LIS.id('sync-comments')
  if (!comments) {
    return
  }
  fetch(`/listings/id/${window.__id__}/comments`)
    .then(response => response.json())
    .then(data => {
      console.log(data)
      const html = window.ejs.render(commentsTemplate, data)
      comments.innerHTML = html
    });
}

// { _id: { tags: 'qui', section: 'blogs' }, count: 11 }
// { _id: { tags: 'voluptatem', section: 'skills' }, count: 8 }
// { _id: { tags: 'rerum', section: 'skills' }, count: 8 }
function renderTopTags(section) {
  const topTags = LIS.id('sync-top-tags')
  if (!topTags) {
    return
  }
  fetch(`/top/tags`)
    .then(response => response.json())
    .then(data => {
      const html = window.ejs.render(topTagsTemplate, { tags: data[section] })
      topTags.innerHTML = html
    });
}

// { _id: 'Tindouf', count: 8 }
// { _id: 'Tebessa', count: 7 }
// { _id: 'Ouargla', count: 6 }
function renderTopByDiv() {
  const topTags = LIS.id('sync-top-by-div')
  if (!topTags) {
    return
  }
  fetch(`/top/div`)
    .then(response => response.json())
    .then(data => {
      const html = window.ejs.render(topDivsTemplate, { tags: data })
      topTags.innerHTML = html
    });
}


