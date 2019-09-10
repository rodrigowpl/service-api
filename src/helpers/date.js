const { format, addDays, isValid } = require('date-fns')
const moment = require('moment')

const getUTCDate = (date) => {
  try {
    if (!isValid(date)) return null
    return moment.utc(date)
  } catch (err) {
    return null
  }
}

const convertUTCToLocalDate = (date) => {
  const localDate = moment(date).local()
  return localDate
}

const formatHour = (date, utc) => {
  let _date = convertUTCToLocalDate(date)
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
