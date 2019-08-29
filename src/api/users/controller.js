const bcrypt = require('bcrypt')

const { User, Account, GasStation, Supply } = require('../models')

const { SUPPLY_STATUS } = require('../supplies/supply-status')

const { humanizeDateTime } = require('../../helpers/date')
const { generateJWTToken, generatePinCode } = require('../../helpers/token')

const { BALANCE_TYPE } = require('./balance-type')

module.exports = {
  login: async (req, res) => {
    const { email, senha } = req.body
    const user = await User.findOne({
      where: { email }
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

    const token = generateJWTToken(email)
    const response = {
      id: user.id,
      nome: user.nome,
      tipoConta: user.tipoConta,
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
      email,
      senha: passwordEncrypted,
      cpf,
      placa,
      accountId: idConta
    })

    res.send(user)
  },

  getBalance: async (req, res) => {
    const userId = req.params.userId

    const user = await User.findOne({
      where: { id: userId },
      include: [Account]
    })

    let balance = 0
    if (user.tipoSaldo === BALANCE_TYPE.SHARED) {
      balance = user.account.saldo
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

    const history = concludedSupplies.map(({ gasStation, combustivel, totalLitros, totalCreditos, dataConclusao, valor }) => {
      return {
        nome: gasStation.nome,
        bandeira: gasStation.bandeira,
        logradouro: gasStation.logradouro,
        data: humanizeDateTime(dataConclusao),
        combustivel,
        totalLitros,
        valorAbastecimento: valor,
        valorEmCreditos: totalCreditos
      }
    })

    res.send(history)
  }
}