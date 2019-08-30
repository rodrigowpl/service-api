const { Op } = require('sequelize')
const bcrypt = require('bcrypt')
const R = require('ramda')
const { startOfDay, endOfDay } = require('date-fns')

const { Account, GasStation, User, Supply } = require('../models')

const { SUPPLY_STATUS } = require('../supplies/supply-status')

const { generateJWTToken } = require('../../helpers/token')
const { humanizeDateTime, formatHour } = require('../../helpers/date')

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
    const { accountId } = req.params

    const { gasStation } = await Account.findOne({
      where: { id: accountId },
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
    const { accountId } = req.params

    const account = await Account.findOne({
      where: { id: accountId },
      include: [{
        model: User,
        attributes: ['id', 'codigo', 'nome', 'cpf', 'placa', 'usuario'],
        as: 'users'
      }]
    })

    res.send(account.users)
  },

  getAllSupplies: async (req, res) => {
    const { accountId } = req.params

    const account = await Account.findOne({
      where: { id: accountId },
      include: [{
        model: User,
        as: 'users',
        attributes: ['id']
      }]
    })

    const allUserSupplies = await Promise.all(
      account.users.map(async ({ id: userId }) => {
        const pendentSupplies = await Supply.findAll({
          where: {
            userId,
            status: SUPPLY_STATUS.PENDENT,
            createdAt: {
              [Op.between]: [startOfDay(new Date()), endOfDay(new Date())]
            },
          },
          order: [['created_at', 'DESC']]
        })

        const concludedSupplies = await Supply.findAll({
          where: {
            userId,
            status: SUPPLY_STATUS.CONCLUDED,
            dataConclusao: {
              [Op.between]: [startOfDay(new Date()), endOfDay(new Date())]
            },
          },
          order: [['data_conclusao', 'DESC']]
        })

        const normalize = (type, data) => data.map(item => ({
          id: item.id,
          placa: item.placa,
          valor: item.valor,
          combustivel: item.combustivel,
          dataRealizado: type === 'concluded' ? humanizeDateTime(item.dataConclusao) : formatHour(item.createdAt),
          token: item.token
        }))

        return {
          emAndamento: normalize('pendent', pendentSupplies),
          concluido: normalize('concluded', concludedSupplies)
        }
      })
    )

    const response = allUserSupplies.reduce((acc, curr) => {
      const onGoing = acc.emAndamento || []
      const concluded = acc.concluido || []

      const item = {
        emAndamento: onGoing.concat(curr.emAndamento),
        concluido: concluded.concat(curr.concluido)
      }

      return item
    }, {})

    res.send(response)
  }
}
