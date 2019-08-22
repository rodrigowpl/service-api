const bcrypt = require('bcrypt')
const createError = require('http-errors')

const { generateJWTToken } = require('../../helpers/token')

const { User, Company } = require('../models')

const { BUDGET_TYPE } = require('./budget_type')

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

  getBudget: async (req, res) => {
    const userId = req.params.userId

    const user = await User.findOne({
      where: { id: userId },
      include: [Company]
    })

    let budget = 0
    if (user.tipoSaldo === BUDGET_TYPE.PERSONAL) {
      budget = user.saldo
    } else if (user.tipoConta === BUDGET_TYPE.SHARED) {
      budget = user.company.saldo
    }

    return res.send({ saldo: budget })
  }
}