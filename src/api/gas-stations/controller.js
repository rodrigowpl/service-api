const { User, GasStation, Account } = require('../models')

const { formatHour } = require('../../helpers/date')
const { ACTIVED, DEACTIVED } = require('../../helpers/constants')

const normalizeResponse = (gasStation) => ({
  id: gasStation.id,
  nome: gasStation.nome,
  bandeira: gasStation.bandeira,
  cidade: gasStation.cidade,
  bairro: gasStation.bairro,
  logradouro: gasStation.logradouro,
  banco: gasStation.banco,
  agencia: gasStation.agencia,
  conta: gasStation.conta,
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
})

module.exports = {
  getAll: async (_, res) => {
    const gasStations = await GasStation.findAll({
      where: {
        ativado: ACTIVED
      }
    })

    const normalizedRespose = gasStations.map(normalizeResponse)

    res.send(normalizedRespose)
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
        as: 'gasStations',
        where: {
          ativado: ACTIVED
        },
        required: true
      }]
    })

    const response = gasStations.map(gasStation => (
      normalizeResponse(gasStation)
    ))

    res.send(response)
  },

  create: async (req, res) => {
    const gasStation = await GasStation.create(req.body)
    res.send(normalizeResponse(gasStation))
  },

  update: async (req, res) => {
    const { gasStationId } = req.params

    const gasStation = await GasStation.findOne({
      where: { id: gasStationId }
    })

    const gasStationUpdated = await gasStation.update(req.body)

    res.send(normalizeResponse(gasStationUpdated))
  },

  delete: async (req, res) => {
    const { gasStationId } = req.params

    await GasStation.update({
      ativado: DEACTIVED
    }, {
      where: { id: gasStationId }
    })

    res.send('Removido com sucesso')
  }
}
