module.exports = {
  fixedNumberTwoDecimals: (value) => {
    return Math.round(value * 100) / 100
  }
}
