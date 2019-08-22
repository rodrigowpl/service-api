const { Company } = require('../models')

module.exports = {
  create: async (req, res) => {
    const { nome, saldo } = req.body

    const company = await Company.create({ nome, saldo })

    res.send(company)
  }
}
