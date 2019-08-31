const express = require('express')

const AccountController = require('./controller')
const GasStationAccountController = require('../gas-stations-accounts/controller')

const router = express.Router()

router.get('/', AccountController.getAll)
router.post('/', AccountController.create)
router.put('/:accountId', AccountController.update)
router.delete('/:accountId', AccountController.delete)
router.post('/login', AccountController.login)
router.post('/habilitarPostos', GasStationAccountController.enableOrDisable)
router.get('/:accountId/postos', AccountController.getAllGasStations)
router.get('/:accountId/faturamento', AccountController.getTotalBiling)
router.get('/:accountId/usuarios', AccountController.getUsers)
router.get('/:accountId/abastecimentos', AccountController.getAllSupplies)

module.exports = router
