const express = require('express')

const ReportsController = require('./controller')

const router = express.Router()

router.get('/abastecimentos', ReportsController.getAllSupplies)

module.exports = router
