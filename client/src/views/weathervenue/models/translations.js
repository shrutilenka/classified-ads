export const weekdaysLangs = (language) => {
    switch (language) {
        case 'en':
            return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        case 'ar':
            return ['الأحد', 'الإثنين', 'الثلثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
        case 'fr':
            return ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
        default:
            throw new Error('Language mapping error in _weekdayNames with language=', language)
    }
}

export const aqiLangs = (language) => {
    switch (language) {
        case 'en':
            return {
                1: 'Air quality: Good',
                2: 'Air quality: Fair',
                3: 'Air quality: Moderate',
                4: 'Air quality: Poor',
                5: 'Air quality: Very Poor',
            }
        case 'ar':
            return {
                1: 'جودة الهواء: جيدة',
                2: 'جودة الهواء: مقبولة',
                3: 'جودة الهواء: متوسطة',
                4: 'جودة الهواء: ضعيفة',
                5: 'جودة الهواء: ضعيفة جدا',
            }
        case 'fr':
            return {
                1: "Qualité de l'air: bonne",
                2: "Qualité de l'air: passable",
                3: "Qualité de l'air: modérée",
                4: "Qualité de l'air: médiocre",
                5: "Qualité de l'air: très mauvaise",
            }
        default:
            throw new Error('Language mapping error in _aqiInterpretation with language=', language)
    }
}

export const picturesLangs = (language) => {
    let success, fail
    switch (language) {
        case 'en':
            success = (place) => `Local pictures of ${place}`
            fail = (place) => `There are no pictures found for ${place}`
            return [success, fail]
        case 'ar':
            success = (place) => `صور منطقة ${place}`
            fail = (place) => `لا توجد صور لمنطقة ${place}`
            return [success, fail]
        case 'fr':
            success = (place) => `Photos locales de ${place}`
            fail = (place) => `Il n'y a pas de photos trouvées pour ${place}`
            return [success, fail]
        default:
            throw new Error('Language mapping error in picturesLangs with language=', language)
    }
}
