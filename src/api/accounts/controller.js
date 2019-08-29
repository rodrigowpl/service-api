const bcrypt = require('bcrypt')

const { Account, GasStation } = require('../models')

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
}
