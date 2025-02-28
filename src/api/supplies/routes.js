const express = require('express')

const SupplyController = require('./controller')

const router = express.Router()

router.post('/', SupplyController.create)
router.patch('/', SupplyController.performSupply)
router.get('/status/:tokenId', SupplyController.getStatus)
router.delete('/:supplyId', SupplyController.cancelSupply)
router.post('/validarToken', SupplyController.validateToken)

module.exports = router
