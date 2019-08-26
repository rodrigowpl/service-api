const { Configuration } = require('../models')

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

  getConfiguration: async ({ fuelType, companyId, gasStationId }) => {
    const configuration = await Configuration.findOne({
      combustivel: fuelType,
      companyId,
      gasStationId
    })

    return configuration
  }
}
