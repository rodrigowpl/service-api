const bcrypt = require('bcrypt')
const createError = require('http-errors')

const { generateJWTToken } = require('../../helpers/token')

const { Driver } = require('../models')

module.exports = {
  login: async (req, res, next) => {
    const { email, senha } = req.body
    const driver = await Driver.findOne({
      where: { email }
    })

    if (!driver) {
      return next(createError(401, 'Usuário inválido'))
    }

    const isValidPassword = await bcrypt.compare(senha, driver.senha)
    if (!isValidPassword) {
      return next(createError(401, 'Senha inválida'))
    }

    const token = generateJWTToken(email)

    const response = {
      id: driver.id,
      nome: driver.nome,
      token
    }
    res.send(response)
  }
}
