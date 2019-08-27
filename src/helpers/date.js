const { format, addDays } = require('date-fns')

const formatHour = date => {
  return format(date, 'HH:mm')
}

const formatDate = (date, daysToAdd) => {
  const dateFormat = 'DD/MM/YYYY'
  if (daysToAdd) {
    return format(addDays(date, daysToAdd), dateFormat)
  }
  return format(date, dateFormat)
}

module.exports = {
  formatHour,
  formatDate,
  humanizeDateTime: date => `${formatDate(date)} às ${formatHour(date)}`
}
