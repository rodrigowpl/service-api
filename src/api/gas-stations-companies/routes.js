const express = require('express')

const GasStationController = require('./controller')

const router = express.Router()

router.post('/', GasStationController.create)

module.exports = router
