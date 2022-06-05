import { tidy } from 'htmltidy2';

// options http://api.html-tidy.org/tidy/tidylib_api_5.6.0/tidy_quickref.html

const opt = { 'show-body-only': 'yes' }
tidy('<div>vvgozei</div>', opt, function (err, html) {
    console.log(html);
});