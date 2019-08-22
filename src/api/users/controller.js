const bcrypt = require('bcrypt')
const createError = require('http-errors')

const { User, Company, GasStation, Supply } = require('../models')

const { SUPPLY_STATUS } = require('../supplies/supply-status')

const { formatDate } = require('../../helpers/date')
const { generateJWTToken } = require('../../helpers/token')

const { BALANCE_TYPE } = require('./balance_type')

module.exports = {
  login: async (req, res, next) => {
    const { email, senha } = req.body
    const user = await User.findOne({
      where: { email }
    })

    if (!user) {
      return next(createError(401, 'Usuário inválido'))
    }

    const isValidPassword = await bcrypt.compare(senha, user.senha)
    if (!isValidPassword) {
      return next(createError(401, 'Senha inválida'))
    }

    const token = generateJWTToken(email)

    const response = {
      id: user.id,
      nome: user.nome,
      tipoConta: user.tipoConta,
      token
    }
    res.send(response)
  },

  create: async (user) => {
    const passwordEncrypted = await bcrypt.hash(user.senha, 12)

    const gasola = await Company.findOne({
      where: {
        nome: 'Gasola'
      }
    })

    const userCreated = await User.create({
      ...user,
      companyId: gasola.id,
      senha: passwordEncrypted
    })

    return userCreated
  },

  getBalance: async (req, res) => {
    const userId = req.params.userId

    const user = await User.findOne({
      where: { id: userId },
      include: [Company]
    })

    let balance = 0
    if (user.tipoSaldo === BALANCE_TYPE.SHARED) {
      balance = user.company.saldo
    } else {
      balance = user.saldo
    }

    return res.send({ saldo: balance })
  },

  getSupplyHistory: async (req, res) => {
    const { userId } = req.params

    const concludedSupplies = await Supply.findAll({
      where: {
        userId,
        status: SUPPLY_STATUS.CONCLUDED
      },
      include: [GasStation]
    })

    const history = concludedSupplies.map(({ gasStation, combustivel, totalLitros, totalCreditos, concludedDate, valor }) => {
      return {
        nome: gasStation.nome,
        bandeira: gasStation.bandeira,
        logradouro: gasStation.logradouro,
        data: formatDate(concludedDate),
        combustivel,
        totalLitros,
        valorAbastecimento: valor,
        valorEmCreditos: totalCreditos
      }
    })

    res.send(history)
  }
}