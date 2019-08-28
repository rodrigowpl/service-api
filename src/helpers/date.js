const { format, addDays } = require('date-fns')
const { convertToTimeZone } = require('date-fns-timezone')

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

  humanizeDateTime: date => `${formatDate(date)} às ${formatHour(date)}`,

  getTodayDate: () => {
    const result = convertToTimeZone(new Date(2019, 8, 25, 1, 0), { timeZone: 'America/Sao_Paulo' })
    return result
  }
}
