module.exports = {
  fixedNumberTwoDecimals: (value) => Math.round(value * 100) / 100,

  calcPercentage: (value, percent) => (value * percent) / 100
}
