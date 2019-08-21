const express = require('express')
const bodyParser = require('body-parser')

const { SERVER_PORT } = require('../config/settings')

const usersRoutes = require('./users/routes')
const driversRoutes = require('./drivers/routes')

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

// const motoristas = require('./routes/motoristas')
// const contas = require('./routes/contas')
// const postos = require('./routes/postos')

app.use('/v1/usuarios', usersRoutes)
app.use('/v1/motoristas', driversRoutes)
// app.use('/v1/contas', contas)
// app.use('/v1/postos', postos)

module.exports = () => {
  return app.listen({ port: SERVER_PORT }, () => {
    console.log(`🚀 Server ready at http://localhost:${SERVER_PORT}`)
  })
}
