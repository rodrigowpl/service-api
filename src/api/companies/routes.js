const express = require('express')

const CompanyController = require('./controller')

const router = express.Router()

router.get('/', CompanyController.getAll)
router.post('/', CompanyController.create)

module.exports = router
