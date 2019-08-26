const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const { SERVER_PORT } = require('../config/settings')

const usersRoutes = require('./users/routes')
const gastStationRoutes = require('./gas-stations/routes')
const companyRoutes = require('./companies/routes')
const supplyRoutes = require('./supplies/routes')
const reportsRoutes = require('./reports/routes')
const configurationRoutes = require('./configurations/routes')

const app = express()

const port = process.env.PORT || SERVER_PORT

app.use(cors())

app.use(express.urlencoded({ extended: false }))

app.use(bodyParser.json({
  limit: '50mb', extended: true
}))

app.use(bodyParser.urlencoded({
  limit: '50mb', extended: true
}))

app.get('/v1/usuarios', (req, res) => {
  res.send('Hello World!')
})

app.use('/v1/usuarios', usersRoutes)
app.use('/v1/postos', gastStationRoutes)
app.use('/v1/empresas', companyRoutes)
app.use('/v1/abastecimentos', supplyRoutes)
app.use('/v1/relatorios', reportsRoutes)
app.use('/v1/configuracoes', configurationRoutes)

module.exports = () => {
  return app.listen({ port }, () => {
    console.log(`🚀 Server ready at http://localhost:${SERVER_PORT}`)
  })
}
