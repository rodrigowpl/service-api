const { Op } = require('sequelize')
const bcrypt = require('bcrypt')
const R = require('ramda')
const { startOfDay, endOfDay } = require('date-fns')

const { Account, GasStation, User, Supply } = require('../models')

const { SUPPLY_STATUS } = require('../supplies/supply-status')

const { generateJWTToken } = require('../../helpers/token')
const { humanizeDateTime, formatHour } = require('../../helpers/date')
const { ACTIVED, DEACTIVED } = require('../../helpers/constants')
const { getCurrencyFormattedByCents } = require('../../helpers/number')

const GasStationAccountController = require('../gas-stations-accounts/controller')
const ConfigurationController = require('../configurations/controller')

module.exports = {
  getAll: async (req, res) => {
    const accounts = await Account.findAll({
      where: {
        ativado: ACTIVED
      }
    })

    res.send(accounts)
  },

  create: async (req, res) => {
    const { nome, email, senha, cnpj, saldo, banco, telefone, agencia, conta, idEmpresa, idPosto } = req.body
    const passwordEncrypted = await bcrypt.hash(senha, 12)

    const account = await Account.create({
      nome,
      email,
      senha: passwordEncrypted,
      cnpj,
      saldo,
      banco,
      agencia,
      telefone,
      conta,
      companyId: idEmpresa,
      gasStationId: idPosto
    })

    res.send(account)
  },

  update: async (req, res) => {
    const { accountId } = req.params
    const { nome, email, cnpj, saldo, banco, agencia, telefone, conta, idEmpresa, idPosto } = req.body

    const account = await Account.findOne({
      where: {
        id: accountId
      }
    })

    const accountUpdated = await account.update({
      nome,
      email,
      cnpj,
      saldo,
      banco,
      telefone,
      agencia,
      conta,
      companyId: idEmpresa,
      gasStationId: idPosto
    })

    res.send(accountUpdated)
  },

  delete: async (req, res) => {
    const { accountId } = req.params

    await Account.update({
      ativado: DEACTIVED
    }, {
      where: {
        id: accountId
      }
    })

    res.send('Desativado com sucesso')
  },

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

  getAllGasStations: async (req, res) => {
    const { accountId } = req.params
    const { bandeira, cidade, bairro } = req.query

    let where = {}

    if (bandeira) {
      where = {
        ...where,
        bandeira
      }
    }

    if (cidade) {
      where = {
        ...where,
        cidade: {
          [Op.iLike]: `%${cidade}%`
        }
      }
    }

    if (bairro) {
      where = {
        ...where,
        bairro: {
          [Op.iLike]: `%${bairro}%`
        }
      }
    }

    const gasStations = await GasStation.findAll({ where })

    const account = await Account.findOne({
      where: { id: accountId }
    })

    const response = await Promise.all(
      gasStations.map(async (gasStation) => {
        const {
          gasolineConfiguration,
          etanolConfiguration,
          dieselConfiguration
        } = await ConfigurationController.getAllFuelsConfigurations({
          companyId: account.companyId,
          gasStationId: gasStation.id
        })

        return {
          id: gasStation.id,
          habilitado: await GasStationAccountController.getGasStationEnable(accountId, gasStation.id),
          bandeira: gasStation.bandeira,
          nome: gasStation.nome,
          endereco: gasStation.endereco,
          gasolina: gasolineConfiguration.valorVenda,
          ganhoGasolina: gasolineConfiguration.desconto,
          diesel: dieselConfiguration.valorVenda,
          ganhoDiesel: dieselConfiguration.desconto,
          etanol: etanolConfiguration.valorVenda,
          ganhoEtanol: etanolConfiguration.desconto,
          latitude: gasStation.latitude,
          longitude: gasStation.longitude
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
      faturamento: biling / 100
    })
  },

  getAllSupplies: async (req, res) => {
    const { accountId } = req.params

    const users = await User.findAll({ where: { accountId } })
    const allUsersIds = users.reduce((acc, curr) => acc.concat(curr.id), [])

    const pendentSupplies = await Supply.findAll({
      where: {
        userId: {
          [Op.in]: allUsersIds
        },
        status: SUPPLY_STATUS.PENDENT,
        createdAt: {
          [Op.between]: [startOfDay(new Date()), endOfDay(new Date())]
        },
      },
      order: [['created_at', 'DESC']]
    })

    const concludedSupplies = await Supply.findAll({
      where: {
        userId: {
          [Op.in]: allUsersIds
        },
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
      valor: item.valor / 100,
      combustivel: item.combustivel,
      dataRealizado: type === 'concluded' ? humanizeDateTime(item.dataConclusao) : formatHour(item.createdAt),
      token: item.token
    }))

    res.send({
      emAndamento: normalize('pendent', pendentSupplies),
      concluido: normalize('concluded', concludedSupplies)
    })
  },

  getBudget: async (req, res) => {
    const { accountId } = req.params

    const account = await Account.findOne({
      where: { id: accountId },
      include: [{
        model: User,
        as: 'users',
        where: {
          ativado: ACTIVED
        }
      }]
    })

    const allUsersValues = account.users.map(({ saldo }) => saldo)

    const totalUsersBudget = R.sum(allUsersValues)

    const accountBudget = account.saldo
    const sharedBudget = accountBudget - totalUsersBudget

    res.send({
      saldo: getCurrencyFormattedByCents(accountBudget),
      compartilhado: getCurrencyFormattedByCents(sharedBudget),
      especifico: getCurrencyFormattedByCents(totalUsersBudget)
    })
  }
}
