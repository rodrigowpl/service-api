const express = require('express')

const SupplyController = require('./controller')

const router = express.Router()

// router.get('/', SupplyController.getAll)
router.post('/', SupplyController.create)
router.patch('/', SupplyController.performSupply)
router.get('/status/:supplyId', SupplyController.getStatus)
router.delete('/:supplyId', SupplyController.cancelSupply)

module.exports = router
