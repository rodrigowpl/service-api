const express = require('express')

const AccountController = require('./controller')
const GasStationAccountController = require('../gas-stations-accounts/controller')

const router = express.Router()

router.post('/login', AccountController.login)
router.post('/', AccountController.create)
router.post('/habilitarPostos', GasStationAccountController.enableOrDisable)
router.get('/:accountId/postos', AccountController.getAllGasStations)
router.get('/:userId/faturamento', AccountController.getTotalBiling)
router.get('/:accountId/usuarios', AccountController.getUsers)
router.get('/:accountId/abastecimentos', AccountController.getAllSupplies)

module.exports = router
