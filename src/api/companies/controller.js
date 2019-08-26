const { Company } = require('../models')

module.exports = {
  getAll: async (_, res) => {
    const companies = await Company.findAll({
      attributes: ['id', 'nome']
    })
    res.send(companies)
  },
  create: async (req, res) => {
    const { nome, saldo } = req.body

    const company = await Company.create({ nome, saldo })

    res.send(company)
  }
}
