const startServer = require('./api/server')
const { syncDatabase } = require('./api/models')

startServer()
syncDatabase()
