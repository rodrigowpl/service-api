const express = require('express')

const UserController = require('./controller')
const GasStationController = require('../gas-stations/controller')

const router = express.Router()

router.post('/login', UserController.login)
router.post('/', UserController.create)
router.get('/:userId/saldo', UserController.getBalance)
router.get('/:userId/historico', UserController.getSupplyHistory)
router.get('/postos/:userId', GasStationController.getAllByUserAccount)

module.exports = router
