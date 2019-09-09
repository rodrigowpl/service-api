const { Negotiation, GasStation, Company, Account } = require('../models')

const { ACTIVED, DEACTIVED } = require('../../helpers/constants')
const { getS3SignedUrl } = require('../../helpers/s3-upload')

const normalize = data => ({
  id: data.id,
  descricao: data.descricao,
  url: data.url,
  posto: data.gasStation ? data.gasStation.nome : '-',
  empresa: data.company ? data.company.nome : '-',
  idPosto: data.gasStationId,
  idEmpresa: data.companyId
})

module.exports = {
  getAll: async (_, res) => {
    const negotiations = await Negotiation.findAll({
      include: [GasStation, Company],
      where: {
        ativado: ACTIVED
      }
    })

    const normalized = negotiations.map(normalize)

    res.send(normalized)
  },

  getAllByAccount: async (req, res) => {
    const { accountId } = req.params
    const account = await Account.findOne({
      where: { id: accountId }
    })

    let where = {
      ativado: ACTIVED,
    }

    if (account.companyId) {
      where = {
        ...where,
        companyId: account.companyId
      }
    }

    if (account.gasStationId) {
      where = {
        ...where,
        gasStationId: account.gasStationId
      }
    }

    const negotiations = await Negotiation.findAll({
      include: [GasStation, Company],
      where
    })

    const normalized = negotiations.map(normalize)

    res.send(normalized)
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
