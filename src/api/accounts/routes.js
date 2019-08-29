const express = require('express')

const AccountController = require('./controller')
const GasStationAccountController = require('../gas-stations-accounts/controller')

const router = express.Router()

router.post('/login', AccountController.login)
router.post('/', AccountController.create)
router.post('/habilitarPostos', GasStationAccountController.enableOrDisable)
router.get('/:accountId/postos', AccountController.getAllGasStations)

module.exports = router
