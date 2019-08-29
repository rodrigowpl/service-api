const Sequelize = require('sequelize')

const { CONNECTION_STRING, DB_OPTIONS } = require('../config/database')

const SequelizeInstance = new Sequelize(CONNECTION_STRING, DB_OPTIONS)

const Account = require('./accounts/model')(SequelizeInstance)
const User = require('./users/model')(SequelizeInstance)
const GasStation = require('./gas-stations/model')(SequelizeInstance)
const GasStationAccounts = require('./gas-stations-accounts/model')(SequelizeInstance)
const Supply = require('./supplies/model')(SequelizeInstance)
const Company = require('./companies/model')(SequelizeInstance)
const Configuration = require('./configurations/model')(SequelizeInstance)

Supply.belongsTo(User)
Supply.belongsTo(GasStation)

User.belongsTo(Account)
User.hasMany(Supply, { as: 'supplies' })

Account.belongsTo(Company)
Account.belongsTo(GasStation)
Account.hasMany(User, { as: 'users' })
Account.belongsToMany(GasStation, { as: 'gasStations', through: GasStationAccounts })

GasStationAccounts.belongsTo(GasStation)
GasStationAccounts.belongsTo(Account)

Company.hasMany(Account, { as: 'accounts' })

Configuration.belongsTo(GasStation)
Configuration.belongsTo(Company)

const syncDatabase = async () => {
  await SequelizeInstance.sync()
  console.log('Database sync with success!')
}

module.exports = {
  syncDatabase,
  Account,
  User,
  Company,
  GasStation,
  GasStationAccounts,
  Supply,
  Configuration
}
