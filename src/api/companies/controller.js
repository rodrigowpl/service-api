const { Company, User, Supply, GasStation, Account } = require('../models')
const R = require('ramda')

const { SUPPLY_STATUS } = require('../supplies/supply-status')

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
  },

  getTotalBiling: async (req, res) => {
    const { userId } = req.params

    const user = await User.findOne({
      where: { id: userId }
    })

    const { gasStation } = await Account.findOne({
      where: { id: user.accountId },
      include: [GasStation]
    })

    const supplies = await Supply.findAll({
      where: {
        gasStationId: gasStation.id,
        status: SUPPLY_STATUS.CONCLUDED
      }
    })

    const values = supplies.map(({ valor }) => valor)
    const biling = R.sum(values).toFixed(2)

    res.send({
      faturamento: biling
    })
  }
}
