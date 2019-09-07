const { Negotiation, GasStation, Company } = require('../models')

const { ACTIVED, DEACTIVED } = require('../../helpers/constants')

module.exports = {
  getAll: async (_, res) => {
    const negotiation = await Negotiation.findAll({
      include: [GasStation, Company],
      where: {
        ativado: ACTIVED
      }
    })

    const normalize = negotiation.map(({ id, descricao, url, gasStation, company }) => ({
      id,
      descricao,
      url,
      posto: gasStation ? gasStation.nome : '-',
      empresa: company ? company.nome : '-'
    }))

    res.send(normalize)
  },

  create: async (req, res) => {
    const { descricao, url, idEmpresa, idPosto } = req.body
    const negotiation = await Negotiation.create({
      descricao,
      url,
      companyId: idEmpresa,
      gasStationId: idPosto
    })

    res.send(negotiation)
  },

  update: async (req, res) => {
    const { negotiationId } = req.params
    const { descricao, url, idEmpresa, idPosto } = req.body
    const negotiation = await Negotiation.findOne({
      where: { id: negotiationId }
    })

    const negotiationUpdated = await negotiation.update({
      descricao,
      url,
      companyId: idEmpresa,
      gasStationId: idPosto
    })

    res.send(negotiationUpdated)
  },

  delete: async (req, res) => {
    const { negotiationId } = req.params

    await Negotiation.update({
      ativado: DEACTIVED
    },
    {
      where: {
        id: negotiationId
      }
    })

    res.send('Removido com sucesso')
  }
}
