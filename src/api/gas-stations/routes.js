const express = require('express')

const GasStationController = require('./controller')

const router = express.Router()

router.get('/', GasStationController.getAll)
router.post('/', GasStationController.create)
router.put('/:gasStationId', GasStationController.update)
router.delete('/:gasStationId', GasStationController.delete)

module.exports = router
