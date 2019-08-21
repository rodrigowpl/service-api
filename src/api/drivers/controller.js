const bcrypt = require('bcrypt')

const { Driver } = require('../models')

module.exports = {
  create: async (driver) => {
    const passwordEncrypted = await bcrypt.hash(driver.senha, 12)
    const driverCreated = await Driver.create({
      ...driver,
      senha: passwordEncrypted
    })

    return driverCreated
  }
}