const { User, GasStation, Company } = require('../models')

const { formatHour } = require('../../helpers/date')
const { ACTIVED, DEACTIVED } = require('../../helpers/constants')

const { calcPercentage } = require('../../helpers/number')

const ConfigurationController = require('../configurations/controller')

const normalizeResponse = (gasStation) => (
  Object.assign(gasStation.toJSON(), {
    horarioAtendimentoInicio: formatHour(gasStation.horarioAtendimentoInicio),
    horarioAtendimentoFim: formatHour(gasStation.horarioAtendimentoFim),
    geoloc: {
      latitude: gasStation.latitude,
      longitude: gasStation.longitude
    }
  })
)

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

    const company = await Company.findOne({
      where: { id: user.companyId },
      include: [{
        model: GasStation,
        as: 'gasStations',
        where: {
          ativado: ACTIVED
        }
      }]
    })

    const response = await Promise.all(
      company.gasStations.map(async (gasStation) => {
        const {
          gasolineConfiguration,
          etanolConfiguration,
          dieselConfiguration
        } = await ConfigurationController.getAllFuelsConfigurations({
          companyId: company.id,
          gasStationId: gasStation.id
        })

        return Object.assign(normalizeResponse(gasStation), {
          gasolina: gasolineConfiguration.valorVenda,
          diesel: dieselConfiguration.valorVenda,
          etanol: etanolConfiguration.valorVenda,
          ganhoGasolina: calcPercentage(gasolineConfiguration.valorVenda, gasolineConfiguration.desconto, false),
          ganhoDiesel: calcPercentage(dieselConfiguration.valorVenda, dieselConfiguration.desconto, false),
          ganhoEtanol: calcPercentage(etanolConfiguration.valorVenda, etanolConfiguration.desconto, false)
        })
      })
    )

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
