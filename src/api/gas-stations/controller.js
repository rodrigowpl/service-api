const { Company, User, GasStation, GasStationCompany } = require('../models')

const { formatHour } = require('../../helpers/date')

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
      id: gasStation.id,
      nome: gasStation.nome,
      bandeira: gasStation.bandeira,
      logradouro: gasStation.logradouro,
      geoloc: {
        latitude: gasStation.latitude,
        longitude: gasStation.longitude
      },
      gasolina: gasStation.gasolina,
      diesel: gasStation.diesel,
      etanol: gasStation.etanol,
      ganhoGasolina: gasStation.ganhoGasolina,
      ganhoDiesel: gasStation.ganhoDiesel,
      ganhoEtanol: gasStation.ganhoEtanol,
      horarioAtendimentoInicio: formatHour(gasStation.horarioAtendimentoInicio),
      horarioAtendimentoFim: formatHour(gasStation.horarioAtendimentoFim)
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
