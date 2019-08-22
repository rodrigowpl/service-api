const { format } = require('date-fns')

module.exports = {
  formatDateTime: date => {
    return format(date, 'HH:mm')
  }
}
