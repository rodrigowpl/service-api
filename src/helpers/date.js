const { format, addDays } = require('date-fns')

const getUTCDate = (date) => {
  const convertDate = new Date(date)
  return new Date(convertDate.getTime() + (convertDate.getTimezoneOffset() * 60000))
}

const formatHour = (date, utc) => {
  let _date = date
  if (utc) {
    _date = getUTCDate(date)
  }
  return format(_date, 'HH:mm')
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

  getUTCDate
}
