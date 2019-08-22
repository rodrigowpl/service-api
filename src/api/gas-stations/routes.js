const express = require('express')

const GasStationController = require('./controller')

const router = express.Router()

router.get('/:userId', GasStationController.getAll)
router.post('/', GasStationController.create)
router.post('/habilitar', GasStationController.enable)
router.post('/desabilitar', GasStationController.disable)

module.exports = router
