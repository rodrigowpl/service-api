const express = require('express')

const UserController = require('./controller')

const router = express.Router()

router.post('/login', UserController.login)
router.post('/', async (req, res) => {
  const driver = await UserController.create(req.body)
  res.send(driver)
})
router.get('/:userId/saldo', UserController.getBalance)
router.get('/:userId/historico', UserController.getSupplyHistory)

module.exports = router
