const { Company, User, Supply, GasStation } = require('../models')
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

    const { company } = await User.findOne({
      where: { id: userId },
      include: [{
        model: Company,
        include: [{
          model: GasStation,
          as: 'gasStations'
        }]
      }]
    })

    const allGasStationSupplies = await Promise.all(
      company.gasStations.map(async ({ id }) => {
        const supplies = await Supply.findAll({
          where: { gasStationId: id },
          status: SUPPLY_STATUS.CONCLUDED
        })

        return supplies.map(({ valor }) => valor)
      })
    )

    console.log(allGasStationSupplies[0])

    res.send({
      faturamento: R.sum(allGasStationSupplies[0])
    })
  }
}
