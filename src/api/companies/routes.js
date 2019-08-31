const express = require('express')

const CompanyController = require('./controller')

const router = express.Router()

router.get('/', CompanyController.getAll)
router.post('/', CompanyController.create)
router.put('/:companyId', CompanyController.update)
router.delete('/:companyId', CompanyController.delete)

module.exports = router
