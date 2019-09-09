const express = require('express')

const NegotiationController = require('./controller')

const router = express.Router()

router.get('/', NegotiationController.getAll)
router.post('/', NegotiationController.create)
router.put('/:negotiationId', NegotiationController.update)
router.delete('/:negotiationId', NegotiationController.delete)
router.post('/signS3', NegotiationController.getS3Url)

module.exports = router
