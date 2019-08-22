const express = require('express')
const bodyParser = require('body-parser')

const { SERVER_PORT } = require('../config/settings')

const usersRoutes = require('./users/routes')
const gastStationRoutes = require('./gas-stations/routes')
const gasStationCompanyRoutes = require('./gas-stations-companies/routes')
const companyRoutes = require('./companies/routes')

const app = express()

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

//macro data
app.use('/v1/gas-station-company', gasStationCompanyRoutes)
app.use('/v1/company', companyRoutes)

module.exports = () => {
  return app.listen({ port: SERVER_PORT }, () => {
    console.log(`🚀 Server ready at http://localhost:${SERVER_PORT}`)
  })
}
