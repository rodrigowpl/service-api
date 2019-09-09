const { Negotiation, GasStation, Company } = require('../models')

const { ACTIVED, DEACTIVED } = require('../../helpers/constants')
const { getS3SignedUrl } = require('../../helpers/s3-upload')

module.exports = {
  getAll: async (_, res) => {
    const negotiation = await Negotiation.findAll({
      include: [GasStation, Company],
      where: {
        ativado: ACTIVED
      }
    })

    const normalize = negotiation.map(({ id, descricao, url, gasStation, company, gasStationId, companyId }) => ({
      id,
      descricao,
      url,
      posto: gasStation ? gasStation.nome : '-',
      empresa: company ? company.nome : '-',
      idPosto: gasStationId,
      idEmpresa: companyId
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
  },

  getS3Url: async (req, res) => {
    const { fileName, fileType } = req.body
    try {
      const response = await getS3SignedUrl({ fileName, fileType })
      res.send(response)
    } catch (err) {
      console.log(err)
      res.status(422).send({
        code: 422,
        result: err.message
      })
      return
    }
  }
}
