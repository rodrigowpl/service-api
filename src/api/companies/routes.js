const express = require('express')

const CompanyController = require('./controller')

const router = express.Router()

router.get('/', CompanyController.getAll)
router.post('/', CompanyController.create)
router.get('/:userId/faturamento', CompanyController.getTotalBiling)

module.exports = router
