const numeral = require('numeral')

const formatCurrency = (value) => {
  return `R$${numeral(value).format('0,0.00')}`
}

module.exports = {
  fixedNumberTwoDecimals: (value) => Math.round(value * 100) / 100,

  calcPercentage: (value, percent, roundValue = true) => {
    const valueCalculated = (value * percent) / 100
    if (roundValue) {
      return Math.round(valueCalculated)
    }

    return valueCalculated
  },

  getCurrencyFormattedByCents: (value) => {
    if (!value) return 'R$0.00'

    const real = numeral(value).divide(100)
    return formatCurrency(real)
  },

  formatMiles: (value) => {
    return numeral(value).format('0,0')
  },

  formatCurrency
}
