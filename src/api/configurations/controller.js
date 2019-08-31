const { Configuration, Company, GasStation } = require('../models')

const normalizeResponse = (configuration) => ({
  id: configuration.id,
  combustivel: configuration.combustivel,
  valorVenda: configuration.valorVenda,
  taxaGasola: configuration.taxaGasola,
  prazoPagamentoGasola: configuration.prazoPagamentoGasola,
  prazoPagamentoCliente: configuration.prazoPagamentoCliente,
  desconto: configuration.desconto,
  empresa: configuration.company.nome,
  posto: configuration.gasStation.nome
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

    await Configuration.destroy({
      where: { id: configurationId }
    })

    res.send('Removido com sucesso.')
  },

  getAll: async (_, res) => {
    const configurations = await Configuration.findAll({
      include: [Company, GasStation]
    })

    const normalizedResponse = configurations.map(configuration => (
      normalizeResponse(configuration)
    ))

    res.send(normalizedResponse)
  },

  getConfiguration: async ({ fuelType, companyId, gasStationId }) => {
    const configuration = await Configuration.findOne({
      where: {
        combustivel: fuelType,
        companyId,
        gasStationId
      }
    })

    return configuration
  }
}
