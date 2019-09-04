const { GasStationCompany, Account } = require('../models')

module.exports = {
  enableOrDisable: async (req, res) => {
    const { idConta, postos } = req.body

    const account = await Account.findOne({
      where: { id: idConta }
    })

    const gastStations = await Promise.all(
      postos.map(async ({ id, habilitado }) => {
        const [gasStationCompany] = await GasStationCompany.findOrCreate({
          where: {
            companyId: account.companyId,
            gasStationId: id
          }
        })

        if (!habilitado) {
          await gasStationCompany.destroy()
        }

        return {
          id: gasStationCompany.gasStationId,
          habilitado
        }
      })
    )

    res.send(gastStations)
  },

  getGasStationEnable: async (accountId, gasStationId) => {
    const account = await Account.findOne({
      where: { id: accountId }
    })

    const gasStationCompany = await GasStationCompany.findOne({
      where: {
        companyId: account.companyId,
        gasStationId
      }
    })

    return !!gasStationCompany
  }
}
