const Sequelize = require('sequelize')

const { CONNECTION_STRING, DB_OPTIONS } = require('../config/database')

const SequelizeInstance = new Sequelize(CONNECTION_STRING, DB_OPTIONS)

const Driver = require('./drivers/model')(SequelizeInstance)

const syncDatabase = async () => {
  await SequelizeInstance.sync()
  console.log('Database sync with success!')
}

module.exports = {
  syncDatabase,
  Driver
}
