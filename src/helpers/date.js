const { format, addDays, isValid, parse } = require('date-fns')
const moment = require('moment')

const getUTCDate = (date) => {
  try {
    const _date = parse(date)
    if (!isValid(_date)) return null
    return moment.local(_date)
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
    _date = new Date(date.getTime() + date.getTimezoneOffset() * 60000)
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

  getUTCDate,

  convertUTCToLocalDate
}
