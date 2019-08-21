const express = require('express')

const DriverController = require('./controller')

const router = express.Router()

router.post('/', async (req, res) => {
  const driver = await DriverController.create(req.body)
  res.send(driver)
})

module.exports = router
