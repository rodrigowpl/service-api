const R = require('ramda')

const FUEL_TYPE = {
  GASOLINE: 'gasolina',
  ETHANOL: 'etanol',
  DIESEL: 'diesel'
}

module.exports = {
  FUEL_TYPE,
  getAllFuelTypes: () => R.values(FUEL_TYPE)
}