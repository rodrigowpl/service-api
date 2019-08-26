const Sequelize = require('sequelize')

const { CONNECTION_STRING, DB_OPTIONS } = require('../config/database')

const SequelizeInstance = new Sequelize(CONNECTION_STRING, DB_OPTIONS)

const User = require('./users/model')(SequelizeInstance)
const GasStation = require('./gas-stations/model')(SequelizeInstance)
const Supply = require('./supplies/model')(SequelizeInstance)
const Company = require('./companies/model')(SequelizeInstance)
const GasStationCompany = require('./gas-stations-companies/model')(SequelizeInstance)
const Configuration = require('./configurations/model')(SequelizeInstance)

Supply.belongsTo(User)
Supply.belongsTo(GasStation)

User.belongsTo(Company)

Company.hasMany(User, { as: 'users' })
Company.belongsToMany(GasStation, { as: 'gasStations', through: GasStationCompany })

Configuration.belongsTo(GasStation)
Configuration.belongsTo(Company)

const syncDatabase = async () => {
  await SequelizeInstance.sync()
  console.log('Database sync with success!')
}

module.exports = {
  syncDatabase,
  User,
  Company,
  GasStation,
  GasStationCompany,
  Supply,
  Configuration
}
