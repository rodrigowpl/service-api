const { format } = require('date-fns')

const formatHour = date => {
  return format(date, 'HH:mm')
}

const formatDate = date => {
  return format(date, 'DD/MM/YYYY')
}

module.exports = {
  formatHour,
  formatDate,
  humanizeDateTime: date => `${formatDate(date)} às ${formatHour(date)}`
}
