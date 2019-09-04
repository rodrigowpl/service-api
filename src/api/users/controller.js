const { Op } = require('sequelize')
const bcrypt = require('bcrypt')

const { User, Account } = require('../models')

const { generateJWTToken, generatePinCode } = require('../../helpers/token')
const { ACTIVED, DEACTIVED } = require('../../helpers/constants')
const { getCurrencyFormattedByCents } = require('../../helpers/number')

const DEFAULT_ATTRIBUTES = [
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

const normalizeResponse = (user) => (
  Object.assign(user.toJSON(), {
    saldoFormatado: getCurrencyFormattedByCents(user.saldo),
    limiteGastoDiarioFormatado: getCurrencyFormattedByCents(user.limiteGastoDiario),
    limiteGastoMensalFormatado: getCurrencyFormattedByCents(user.limiteGastoMensal)
  })
)

module.exports = {
  login: async (req, res) => {
    const { email, senha } = req.body
    const user = await User.findOne({
      where: {
        email,
        ativado: ACTIVED
      }
    })

    if (!user) {
      res.status(401).send({
        status: 401,
        result: 'Usuário inválido'
      })

      return
    }

    const isValidPassword = await bcrypt.compare(senha, user.senha)
    if (!isValidPassword) {
      res.status(401).send({
        status: 401,
        result: 'Senha inválida'
      })

      return
    }

    const account = await Account.findOne({
      where: { id: user.accountId }
    })

    const token = generateJWTToken(email)
    const response = {
      id: user.id,
      nome: user.nome,
      tipoConta: account.tipoConta,
      placa: user.placa,
      token
    }
    res.send(response)
  },

  create: async (req, res) => {
    const { nome, email, senha, cpf, placa, idConta } = req.body

    const passwordEncrypted = await bcrypt.hash(senha, 12)
    const user = await User.create({
      codigo: generatePinCode(8),
      nome,
      usuario: email,
      email,
      senha: passwordEncrypted,
      cpf,
      placa,
      accountId: idConta
    })

    res.send(user)
  },

  update: async (req, res) => {
    const { userId } = req.params
    const { usuario, senha } = req.body

    const user = await User.findOne({
      attributes: DEFAULT_ATTRIBUTES,
      where: { id: userId }
    })

    let passwordEncrypted
    if (senha) {
      passwordEncrypted = await bcrypt.hash(senha, 12)
    }

    const userUpdated = await user.update({
      ...req.body,
      usuario,
      email: usuario,
      senha: passwordEncrypted || user.senha
    })

    res.send(normalizeResponse(userUpdated))
  },

  updateAll: async (req, res) => {
    const users = req.body

    const usersUpdated = await Promise.all(
      users.map(async ({ id, saldo, limiteGastoMensal, limiteGastoDiario }) => {
        const user = await User.findOne({
          attributes: DEFAULT_ATTRIBUTES,
          where: { id }
        })

        const userUpdated = await user.update({
          saldo,
          limiteGastoMensal,
          limiteGastoDiario
        })

        return normalizeResponse(userUpdated)
      })
    )

    res.send(usersUpdated)
  },

  delete: async (req, res) => {
    const { userId } = req.params

    await User.update({
      ativado: DEACTIVED
    }, {
      where: { id: userId }
    })

    res.send('Removido com sucesso.')
  },

  getBalance: async (req, res) => {
    const userId = req.params.userId

    const user = await User.findOne({
      where: { id: userId }
    })

    return res.send({
      saldo: user.saldo !== null ? `${getCurrencyFormattedByCents(user.saldo)}` : null
    })
  },

  getAllByAccount: async (req, res) => {
    const { accountId } = req.params
    const { codigo, nome, cpf, placa } = req.query

    let where = {
      accountId,
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
      attributes: DEFAULT_ATTRIBUTES
    })

    const normalized = users.map(normalizeResponse)

    res.send(normalized)
  }
}