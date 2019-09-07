const express = require('express')

const UserController = require('./controller')
const GasStationController = require('../gas-stations/controller')
const SupplyController = require('../supplies/controller')

const router = express.Router()

router.post('/login', UserController.login)
router.post('/', UserController.create)
router.get('/:userId/saldo', UserController.getBalance)
router.get('/:userId/postos', GasStationController.getAllByUserAccount)
router.delete('/:userId', UserController.delete)
router.put('/:userId', UserController.update)
router.post('/:accountId/adicionarCreditos', UserController.addCredits)

router.get('/:userId/historico', SupplyController.getSuppliesHistoryByUser)

module.exports = router
