const { format } = require('date-fns')

module.exports = {
  formatDateTime: date => {
    return format(date, 'HH:mm')
  },

  formatDate: date => {
    return format(date, 'DD/MM/YYYY')
  }
}
