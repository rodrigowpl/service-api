const express = require('express')

const AccountController = require('./controller')
const GasStationAccountController = require('../gas-stations-accounts/controller')
const CompanyController = require('../companies/controller')

const router = express.Router()

router.get('/', AccountController.getAll)
router.post('/', AccountController.create)
router.put('/:accountId', AccountController.update)
router.delete('/:accountId', AccountController.delete)
router.post('/login', AccountController.login)
router.get('/:accountId/faturamento', AccountController.getTotalBiling)
router.get('/:accountId/postos', AccountController.getAllGasStations)
router.get('/:accountId/abastecimentos', AccountController.getAllSupplies)

router.get('/:accountId/usuarios', CompanyController.getAllUsers)
router.get('/:accountId/saldo', CompanyController.getBudget)

router.post('/habilitarPostos', GasStationAccountController.enableOrDisable)

module.exports = router
