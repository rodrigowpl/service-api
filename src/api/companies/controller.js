const { Company } = require('../models')

const { ACTIVED, DEACTIVED } = require('../../helpers/constants')

module.exports = {
  getAll: async (_, res) => {
    const companies = await Company.findAll({
      attributes: ['id', 'nome'],
      where: {
        ativado: ACTIVED
      }
    })

    res.send(companies)
  },

  create: async (req, res) => {
    const { nome } = req.body

    const company = await Company.create({ nome })

    res.send(company)
  },

  update: async (req, res) => {
    const { companyId } = req.params

    const company = await Company.findOne({
      where: {
        id: companyId
      }
    })

    const companyUpdated = await company.update(req.body)

    res.send(companyUpdated)
  },

  delete: async (req, res) => {
    const { companyId } = req.params

    await Company.update({
      ativado: DEACTIVED
    }, {
      where: {
        id: companyId
      }
    })

    res.send('Removido com sucesso')
  }
}
