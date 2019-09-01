const numeral = require('numeral')

module.exports = {
  fixedNumberTwoDecimals: (value) => Math.round(value * 100) / 100,

  calcPercentage: (value, percent) => (value * percent) / 100,

  getCurrencyFormattedByCents: (value) => {
    const real = numeral(value).divide(100)
    return `R$${numeral(real).format('0,0.00')}`
  }
}
