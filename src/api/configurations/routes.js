const express = require('express')

const ConfigurationController = require('./controller')

const router = express.Router()

router.get('/', ConfigurationController.getAll)
router.post('/', ConfigurationController.create)
router.put('/:configurationId', ConfigurationController.update)
router.delete('/:configurationId', ConfigurationController.delete)

module.exports = router
