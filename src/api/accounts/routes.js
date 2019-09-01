const express = require('express')

const AccountController = require('./controller')
const GasStationAccountController = require('../gas-stations-accounts/controller')
const UserController = require('../users/controller')

const router = express.Router()

router.get('/', AccountController.getAll)
router.post('/', AccountController.create)
router.put('/:accountId', AccountController.update)
router.delete('/:accountId', AccountController.delete)
router.post('/login', AccountController.login)
router.get('/:accountId/faturamento', AccountController.getTotalBiling)
router.get('/:accountId/postos', AccountController.getAllGasStations)
router.get('/:accountId/abastecimentos', AccountController.getAllSupplies)

router.post('/habilitarPostos', GasStationAccountController.enableOrDisable)

router.get('/:accountId/usuarios', UserController.getAllByAccount)

module.exports = router
