const { User, GasStation, Account } = require('../models')

const { formatHour } = require('../../helpers/date')

module.exports = {
  getAll: async (_, res) => {
    const gasStations = await GasStation.findAll({
      attributes: ['id', 'nome']
    })

    res.send(gasStations)
  },

  getAllByUserAccount: async (req, res) => {
    const userId = req.params.userId

    const user = await User.findOne({
      where: { id: userId }
    })

    const { gasStations } = await Account.findOne({
      where: { id: user.accountId },
      include: [{
        model: GasStation,
        as: 'gasStations'
      }]
    })

    const response = gasStations.map(gasStation => ({
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

    res.send(response)
  },

  create: async (req, res) => {
    const gasStation = await GasStation.create(req.body)
    res.send(gasStation)
  }
}
