const { GasStationCompany } = require('../models')

module.exports = {
  create: async (req, res) => {
    const { postoId, empresaId } = req.body
    const { id } = await GasStationCompany.create({
      gasStationId: postoId,
      companyId: empresaId
    })

    res.send(id)
  }
}
