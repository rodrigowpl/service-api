const { Op } = require('sequelize')
const R = require('ramda')
const numeral = require('numeral')

const { Company, User, Account } = require('../models')

const { ACTIVED, DEACTIVED } = require('../../helpers/constants')
const { getCurrencyFormattedByCents } = require('../../helpers/number')

module.exports = {
  getAll: async (_, res) => {
    const companies = await Company.findAll({
      where: {
        ativado: ACTIVED
      }
    })

    res.send(companies)
  },

  create: async (req, res) => {
    const { saldo } = req.body
    const company = await Company.create({
      ...req.body,
      saldo: saldo ? numeral(saldo).multiply(100).value() : null
    })

    res.send(company)
  },

  update: async (req, res) => {
    const { companyId } = req.params
    const { saldo, limiteGastoDiario } = req.body

    const company = await Company.findOne({
      where: {
        id: companyId
      }
    })

    const companyUpdated = await company.update({
      ...req.body,
      saldo: saldo ? numeral(saldo).multiply(100).value() : null,
      limiteGastoDiario: limiteGastoDiario ? numeral(limiteGastoDiario).multiply(100).value() : null
    })

    res.send(companyUpdated)
  },

  delete: async (req, res) => {
    const { companyId } = req.params

    await Company.update({
      ativado: DEACTIVED
    }, {
      where: {
        id: companyId
      }
    })

    res.send('Removido com sucesso')
  },

  getAllUsers: async (req, res) => {
    const { accountId } = req.params
    const { codigo, nome, cpf, placa } = req.query

    const account = await Account.findOne({
      where: { id: accountId }
    })

    let where = {
      companyId: account.companyId,
      ativado: ACTIVED
    }

    if (codigo) {
      where = {
        ...where,
        codigo: {
          [Op.iLike]: `%${codigo}%`
        }
      }
    }

    if (nome) {
      where = {
        ...where,
        nome: {
          [Op.iLike]: `%${nome}%`
        }
      }
    }

    if (cpf) {
      where = {
        ...where,
        cpf: {
          [Op.iLike]: `%${cpf}%`
        }
      }
    }

    if (placa) {
      where = {
        ...where,
        placa: {
          [Op.iLike]: `%${placa}%`
        }
      }
    }

    const users = await User.findAll({
      where,
      attributes: [
        'id',
        'codigo',
        'nome',
        'cpf',
        'placa',
        'usuario',
        'saldo',
        'limiteGastoDiario',
        'limiteGastoMensal'
      ]
    })

    const normalized = users.map((user) => (
      Object.assign(user.toJSON(), {
        saldoFormatado: getCurrencyFormattedByCents(user.saldo),
        limiteGastoDiarioFormatado: getCurrencyFormattedByCents(user.limiteGastoDiario),
        limiteGastoMensalFormatado: getCurrencyFormattedByCents(user.limiteGastoMensal)
      })
    ))

    res.send(normalized)
  },

  getBudget: async (req, res) => {
    const { accountId } = req.params

    const account = await Account.findOne({
      where: { id: accountId }
    })

    const company = await Company.findOne({
      where: { id: account.companyId },
      include: [{
        model: User,
        as: 'users',
        where: {
          ativado: ACTIVED
        }
      }]
    })

    const allUsersValues = company.users.map(({ saldo }) => saldo)

    const totalUsersBudget = R.sum(allUsersValues)

    const accountBudget = company.saldo
    const sharedBudget = accountBudget - totalUsersBudget

    res.send({
      saldo: getCurrencyFormattedByCents(accountBudget),
      compartilhado: getCurrencyFormattedByCents(sharedBudget),
      especifico: getCurrencyFormattedByCents(totalUsersBudget)
    })
  }
}
