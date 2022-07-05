import isMobile from '../helpers/isMobile.js'
import { aqiLangs, weekdaysLangs } from './translations.js'

export default class AqiCard {
    constructor(language, aqi, today, co, no, no2) {
        const theme = {
            1: '#4C5273',
            2: '#F2E96B',
            3: '#F2CA50',
            4: '#F2A03D',
            5: '#A67041',
        }
        this.style = 'background-color: ' + theme[aqi]
        this.aqiInterpretation = aqiLangs(language)
        this.aqi = aqi
        const d = new Date(0)
        d.setUTCSeconds(today)
        this.ISODate = d.toISOString().slice(5, 10)
        this.dayName = weekdaysLangs(language)[d.getDay()]
        this.co = co
        this.no = no
        this.no2 = no2
    }

    html() {
        let coo = 1
        const showClass = isMobile ? '' : 'show'
        const collapseIcon = '<i class="bi bi-arrows-collapse"></i>'
        return `
          <div class="col-md-3" style="margin-top:20px;">
              <div class="card" style="${this.style}">
                  <h4 class="card-title text-center" data-toggle="collapse" href="#collapseId20" role="button" aria-expanded="false">${collapseIcon}${
            this.aqiInterpretation[this.aqi]
        }</h4>
                  <table style="width:100%">
                      <tr>
                          <th style= 'background-color: #4C5273; font-size: xx-small'>${this.aqiInterpretation[
                              coo++
                          ]
                              .split(':')[1]
                              .trim()}</th>
                          <th style= 'background-color: #F2E96B; font-size: xx-small'>${this.aqiInterpretation[
                              coo++
                          ]
                              .split(':')[1]
                              .trim()}</th>
                          <th style= 'background-color: #F2CA50; font-size: xx-small'>${this.aqiInterpretation[
                              coo++
                          ]
                              .split(':')[1]
                              .trim()}</th>
                          <th style= 'background-color: #F2A03D; font-size: xx-small'>${this.aqiInterpretation[
                              coo++
                          ]
                              .split(':')[1]
                              .trim()}</th>
                          <th style= 'background-color: #A67041; font-size: xx-small'>${this.aqiInterpretation[
                              coo++
                          ]
                              .split(':')[1]
                              .trim()}</th>
                      </tr>
                  </table>
                  <div class="card-body">
                      <div class="collapse" id="collapseId20">
                          <h5 class="card-title text-center">${this.dayName}\n${this.ISODate}</h5>
                          <p class="card-text text-center">CO: ${this.co} <br />NO: ${this.no}<br />NO2: ${
            this.no2
        }</p>
                      </div>
                  </div>
              </div>
          </div>
      `
    }
}
