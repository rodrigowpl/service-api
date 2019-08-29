const { GasStationAccounts } = require('../models')

module.exports = {
  enableOrDisable: async (req, res) => {
    const { idConta, postos } = req.body

    const gastStations = await Promise.all(
      postos.map(async ({ id, habilitado }) => {
        const [gasStationAccount] = await GasStationAccounts.findOrCreate({
          where: {
            accountId: idConta,
            gasStationId: id
          }
        })

        if (!habilitado) {
          await gasStationAccount.destroy()
        }

        return {
          id: gasStationAccount.gasStationId,
          habilitado
        }
      })
    )

    res.send(gastStations)
  },

  getGasStationEnable: async (accountId, gasStationId) => {
    const gasStationAccount = await GasStationAccounts.findOne({
      where: { accountId, gasStationId }
    })

    return !!gasStationAccount
  }
}
