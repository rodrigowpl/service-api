const { Company, User, GasStation, GasStationCompany } = require('../models')

const { formatDateTime } = require('../../helpers/date')

module.exports = {
  getAll: async (req, res) => {
    const userId = req.params.userId
    const { company } = await User.findOne({
      where: { id: userId },
      include: {
        model: Company,
        include: [{
          model: GasStation,
          as: 'gasStations'
        }]
      }
    })

    const gasStations = company.gasStations.map(gasStation => ({
      nome: gasStation.nome,
      horarioAtendimentoInicio: formatDateTime(gasStation.horarioAtendimentoInicio),
      horarioAtendimentoFim: formatDateTime(gasStation.horarioAtendimentoFim)
    }))

    res.send(gasStations)
  },

  create: async (req, res) => {
    const gasStation = await GasStation.create(req.body)
    res.send(gasStation)
  },

  enable: async (req, res) => {
    const { postoId, empresaId } = req.body
    await GasStationCompany.create({
      gasStationId: postoId,
      companyId: empresaId
    })

    res.send('Habilitado com sucesso!')
  },

  disable: async (req, res) => {
    const { postoId, empresaId } = req.body
    await GasStationCompany.destroy({
      where: {
        gasStationId: postoId,
        companyId: empresaId
      }
    })

    res.send('Desabilitado com sucesso!')
  }
}
