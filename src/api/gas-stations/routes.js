const express = require('express')

const GasStationController = require('./controller')

const router = express.Router()

router.get('/', GasStationController.getAll)
router.post('/', GasStationController.create)

module.exports = router
