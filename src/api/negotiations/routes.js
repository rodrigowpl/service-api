const express = require('express')

const NegotiationController = require('./controller')

const router = express.Router()

router.get('/', NegotiationController.getAll)
router.post('/', NegotiationController.create)
router.put('/:negotiationId', NegotiationController.update)
router.delete('/:negotiationId', NegotiationController.delete)

module.exports = router
