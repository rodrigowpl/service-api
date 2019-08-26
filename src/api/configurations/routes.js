const express = require('express')

const ConfigurationController = require('./controller')

const router = express.Router()

router.post('/', ConfigurationController.create)

module.exports = router
