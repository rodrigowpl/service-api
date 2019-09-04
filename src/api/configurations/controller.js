const { Configuration, Company, GasStation } = require('../models')

const { ACTIVED, DEACTIVED } = require('../../helpers/constants')

const { FUEL_TYPE } = require('../supplies/fuel_type')

const normalizeResponse = (configuration) => ({
  id: configuration.id,
  combustivel: configuration.combustivel,
  valorVenda: configuration.valorVenda,
  taxaGasola: configuration.taxaGasola,
  prazoPagamentoGasola: configuration.prazoPagamentoGasola,
  prazoPagamentoCliente: configuration.prazoPagamentoCliente,
  desconto: configuration.desconto,
  empresa: configuration.company ? configuration.company.nome : '-',
  posto: configuration.gasStation ? configuration.gasStation.nome : '-',
  idEmpresa: configuration.companyId,
  idPosto: configuration.gasStationId
})

module.exports = {
  create: async (req, res) => {
    const {
      combustivel,
      valorVenda,
      taxaGasola,
      prazoPagamentoGasola,
      prazoPagamentoCliente,
      desconto,
      idPosto,
      idEmpresa
    } = req.body

    const configuration = await Configuration.create({
      combustivel,
      valorVenda,
      taxaGasola,
      prazoPagamentoCliente,
      prazoPagamentoGasola,
      desconto,
      gasStationId: idPosto,
      companyId: idEmpresa
    })

    res.send(configuration)
  },

  update: async (req, res) => {
    const {
      combustivel,
      valorVenda,
      taxaGasola,
      prazoPagamentoGasola,
      prazoPagamentoCliente,
      desconto,
      idPosto,
      idEmpresa
    } = req.body
    const { configurationId } = req.params

    const configuration = await Configuration.findOne({
      include: [Company, GasStation],
      where: { id: configurationId }
    })

    const configurationUpdated = await configuration.update({
      combustivel,
      valorVenda,
      taxaGasola,
      prazoPagamentoCliente,
      prazoPagamentoGasola,
      desconto,
      gasStationId: idPosto,
      companyId: idEmpresa
    })

    res.send(normalizeResponse(configurationUpdated))
  },

  delete: async (req, res) => {
    const { configurationId } = req.params

    await Configuration.update({
      ativado: DEACTIVED
    }, {
      where: { id: configurationId }
    })

    res.send('Removido com sucesso.')
  },

  getAll: async (_, res) => {
    const configurations = await Configuration.findAll({
      include: [Company, GasStation],
      where: {
        ativado: ACTIVED
      }
    })

    const normalizedResponse = configurations.map(normalizeResponse)

    res.send(normalizedResponse)
  },

  getConfiguration: async ({ fuelType, gasStationId, companyId }) => {
    const configuration = await Configuration.findOne({
      where: {
        combustivel: fuelType,
        companyId,
        gasStationId,
        ativado: ACTIVED
      }
    })

    return configuration
  },

  getAllFuelsConfigurations: async ({ gasStationId, companyId }) => {
    const gasolineConfiguration = await Configuration.findAll({
      where: {
        combustivel: FUEL_TYPE.GASOLINE,
        companyId,
        gasStationId,
        ativado: ACTIVED
      }
    })

    const etanolConfiguration = await Configuration.findAll({
      where: {
        combustivel: FUEL_TYPE.ETHANOL,
        companyId,
        gasStationId,
        ativado: ACTIVED
      }
    })

    const dieselConfiguration = await Configuration.findAll({
      where: {
        combustivel: FUEL_TYPE.DIESEL,
        companyId,
        gasStationId,
        ativado: ACTIVED
      }
    })

    return { gasolineConfiguration, etanolConfiguration, dieselConfiguration }
  }
}
