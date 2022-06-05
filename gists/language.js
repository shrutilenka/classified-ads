;(async () => {
  const LanguageDetection = require('@smodin/fast-text-language-detection')
  const lid = new LanguageDetection()

  const language = await lid.predict('FastText-LID provides a great language identification mais pourquoi pas alors', 3)
  if(language[0].prob > 0.5)
    console.log(language[0].lang)
  else
    console.log("none")
  // console.log(await lid.predict('FastText-LID provides a great language identification'))
  // console.log(await lid.predict('FastText-LID bietet eine hervorragende Sprachidentifikation'))
  // console.log(await lid.predict('FastText-LID fornisce un ottimo linguaggio di identificazione'))
  // console.log(await lid.predict('FastText-LID fournit une excellente identification de la langue'))
  // console.log(await lid.predict('FastText-LID proporciona una gran identificación de idioma'))
  // console.log(await lid.predict('FastText-LID обеспечивает отличную идентификацию языка'))
  // console.log(await lid.predict('FastText-LID提供了很好的語言識別'))
})()

// [
//   { lang: 'fr', prob: 0.5018489360809326, isReliableLanguage: true },
//   { lang: 'en', prob: 0.21594876050949097, isReliableLanguage: true },
//   { lang: 'pt', prob: 0.06396475434303284, isReliableLanguage: true }
// ]
