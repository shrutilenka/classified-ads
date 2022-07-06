import axios from "axios";

axios.get('https://raw.githubusercontent.com/bacloud22/classified-ads/main/README.md')
  .then(function (response) {
    // handle success
    console.log(response);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  .then(function () {
    // always executed
  });