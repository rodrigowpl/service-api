const bcrypt = require('bcrypt')
const R = require('ramda')

const { Account, GasStation, User, Supply } = require('../models')

const { SUPPLY_STATUS } = require('../supplies/supply-status')

const { generateJWTToken } = require('../../helpers/token')

const gasStationAccountController = require('../gas-stations-accounts/controller')

module.exports = {
  login: async (req, res) => {
    const { email, senha } = req.body
    const account = await Account.findOne({
      where: { email }
    })

    if (!account) {
      res.status(401).send({
        status: 401,
        result: 'Usuário inválido'
      })

      return
    }

    const isValidPassword = await bcrypt.compare(senha, account.senha)
    if (!isValidPassword) {
      res.status(401).send({
        status: 401,
        result: 'Senha inválida'
      })

      return
    }

    const token = generateJWTToken(email)
    const response = {
      id: account.id,
      nome: account.nome,
      token
    }
    res.send(response)
  },

  create: async (req, res) => {
    const { nome, email, senha, idEmpresa, idPosto } = req.body
    const passwordEncrypted = await bcrypt.hash(senha, 12)

    const account = await Account.create({
      nome,
      email,
      senha: passwordEncrypted,
      companyId: idEmpresa,
      gasStationId: idPosto
    })

    res.send(account)
  },

  getAllGasStations: async (req, res) => {
    const { accountId } = req.params
    const gasStations = await GasStation.findAll()

    const response = await Promise.all(
      gasStations.map(async (gasStation) => {
        return {
          id: gasStation.id,
          habilitado: await gasStationAccountController.getGasStationEnable(accountId, gasStation.id),
          bandeira: gasStation.bandeira,
          nome: gasStation.nome,
          endereco: `${gasStation.logradouro}, ${gasStation.bairro}, ${gasStation.cidade}`,
          gasolina: gasStation.gasolina,
          ganhoGasolina: gasStation.ganhoGasolina,
          diesel: gasStation.diesel,
          ganhoDiesel: gasStation.ganhoDiesel,
          etanol: gasStation.etanol,
          ganhoEtanol: gasStation.ganhoEtanol
        }
      })
    )

    res.send(response)
  },


  getTotalBiling: async (req, res) => {
    const { userId } = req.params

    const user = await User.findOne({
      where: { id: userId }
    })

    const { gasStation } = await Account.findOne({
      where: { id: user.accountId },
      include: [GasStation]
    })

    const supplies = await Supply.findAll({
      where: {
        gasStationId: gasStation.id,
        status: SUPPLY_STATUS.CONCLUDED
      }
    })

    const values = supplies.map(({ valor }) => valor)
    const biling = R.sum(values).toFixed(2)

    res.send({
      faturamento: biling
    })
  },

  getUsers: async (req, res) => {
    const { userId } = req.params

    const user = await User.findOne({
      where: { id: userId }
    })

    const account = await Account.findOne({
      where: { id: user.accountId },
      include: [{
        model: User,
        as: 'users'
      }]
    })

    const response = account.users.map(user => ({
      id: user.id,
      numero: user.codigo,
      nome: user.nome,
      cpf: user.cpf,
      placa: user.placa,
      usuario: user.usuario
    }))

    res.send(response)
  }
}
