export const _adsHolder = (company) => {
    switch (company) {
        case 'Google':
            return `
                  <div class="col-md-3" style="margin-top:20px;">
                      <div class="card" style="background-color: red;">
                          <div class="card-body">
                              <p>Ads go here</p>
                          </div>
                      </div>
                  </div>
                  `
        default:
            break
    }
}
