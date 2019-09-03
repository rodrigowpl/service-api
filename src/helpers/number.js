const numeral = require('numeral')

const formatCurrency = (value) => {
  return `R$${numeral(value).format('0,0.00')}`
}

module.exports = {
  fixedNumberTwoDecimals: (value) => Math.round(value * 100) / 100,

  calcPercentage: (value, percent) => (value * percent) / 100,

  getCurrencyFormattedByCents: (value) => {
    if (!value) return 'R$0.00'

    const real = numeral(value).divide(100)
    return formatCurrency(real)
  },

  formatCurrency
}
