
// eslint-disable-next-line max-len
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Sync data @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// Each ID in LIS.id('comments') must be uniq
import { LIS } from '../../helpers/lis';
import { commentsTemplate } from './comments-template';
import { topTagsTemplate } from './top-tags-template';
// renderTopByDiv
// on Index page

// renderTopTags
// on sections pages
export const renderShared = () => {
  // if (window.__section__) {
  //     renderTopTags()
  // }

  // if (index page) {
  //   renderTopByDiv(window.__section__)
  // }
}

let people = ['geddy', 'neil', 'alex'];
let html = window.ejs.render(`<%= people.join(", "); %>`, { people: people });
console.log(html)

function renderComments() {
  const comments = LIS.id('sync-comments')
  fetch(`/listings/id/${window.__id__}/comments`)
    .then(response => response.json())
    .then(data => {
      console.log(data)
      window.ejs.render(commentsTemplate, { comments: data })
    });
}

// { _id: { tags: 'qui', section: 'blogs' }, count: 11 }
// { _id: { tags: 'voluptatem', section: 'skills' }, count: 8 }
// { _id: { tags: 'rerum', section: 'skills' }, count: 8 }
function renderTopTags() {
  const topTags = LIS.id('sync-top-tags')
  fetch(`/top/tags`)
    .then(response => response.json())
    .then(data => {
      console.log(data)
      const html = window.ejs.render(topTagsTemplate, { tags: data })
      topTags.innerHTML = html
    });
}

// { _id: 'Tindouf', count: 8 }
// { _id: 'Tebessa', count: 7 }
// { _id: 'Ouargla', count: 6 }
function renderTopByDiv(section) {
  const topTags = LIS.id('sync-top-by-div')
  fetch(`/top/div/${section}`)
    .then(response => response.json())
    .then(data => {
      console.log(data)
      const html = window.ejs.render(topTagsTemplate, { tags: data })
      topTags.innerHTML = html
    });
}


