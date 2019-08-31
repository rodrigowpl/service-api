const bcrypt = require('bcrypt')
const camelCase = require('camelcase')

const { User, Account, GasStation, Supply } = require('../models')

const { SUPPLY_STATUS } = require('../supplies/supply-status')

const { humanizeDateTime } = require('../../helpers/date')
const { generateJWTToken, generatePinCode } = require('../../helpers/token')
const { ACTIVED, DEACTIVED } = require('../../helpers/constants')

const { BALANCE_TYPE } = require('./balance-type')

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

    const token = generateJWTToken(email)
    const response = {
      id: user.id,
      nome: user.nome,
      tipoConta: user.tipoConta,
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
    const { nome, email, senha, cpf, placa } = req.body

    const user = await User.findOne({
      where: { id: userId }
    })

    let passwordEncrypted
    if (senha) {
      passwordEncrypted = await bcrypt.hash(senha, 12)
    }

    const userUpdated = await user.update({
      nome,
      usuario: email,
      email,
      senha: passwordEncrypted || user.senha,
      cpf,
      placa
    })

    const response = {
      id: userUpdated.id,
      codigo: userUpdated.codigo,
      nome: userUpdated.nome,
      cpf: userUpdated.cpf,
      placa: userUpdated.placa,
      usuario: userUpdated.usuario
    }

    res.send(response)
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
      include: [GasStation],
      where: {
        userId,
        status: SUPPLY_STATUS.CONCLUDED,
      },
      order: [['data_conclusao', 'DESC']]
    })

    const history = concludedSupplies.map(({ gasStation, combustivel, totalLitros, totalCreditos, dataConclusao, valor }) => {
      return {
        nome: gasStation.nome,
        bandeira: gasStation.bandeira,
        logradouro: gasStation.logradouro,
        data: humanizeDateTime(dataConclusao),
        combustivel: camelCase(combustivel, { pascalCase: true }),
        totalLitros,
        valorAbastecimento: valor,
        valorEmCreditos: totalCreditos
      }
    })

    res.send(history)
  }
}