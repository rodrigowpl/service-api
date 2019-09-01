const { Op } = require('sequelize')
const bcrypt = require('bcrypt')
const R = require('ramda')
const { startOfDay, endOfDay } = require('date-fns')

const { Account, GasStation, User, Supply } = require('../models')

const { SUPPLY_STATUS } = require('../supplies/supply-status')

const { generateJWTToken } = require('../../helpers/token')
const { humanizeDateTime, formatHour } = require('../../helpers/date')
const { ACTIVED, DEACTIVED } = require('../../helpers/constants')

const gasStationAccountController = require('../gas-stations-accounts/controller')

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
    const { nome, email, senha, saldo, banco, agencia, conta, idEmpresa, idPosto } = req.body
    const passwordEncrypted = await bcrypt.hash(senha, 12)

    const account = await Account.create({
      nome,
      email,
      saldo,
      banco,
      agencia,
      conta,
      senha: passwordEncrypted,
      companyId: idEmpresa,
      gasStationId: idPosto
    })

    res.send(account)
  },

  update: async (req, res) => {
    const { accountId } = req.params
    const { nome, email, saldo, banco, agencia, conta, idEmpresa, idPosto } = req.body

    const account = await Account.findOne({
      where: {
        id: accountId
      }
    })

    const accountUpdated = await account.update({
      nome,
      email,
      saldo,
      banco,
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

    const gasStations = await GasStation.findAll({
      where
    })

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
          ganhoEtanol: gasStation.ganhoEtanol,
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
      faturamento: biling
    })
  },

  getAllUsers: async (req, res) => {
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
      attributes: [
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
    })

    res.send(users)
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
      valor: item.valor,
      combustivel: item.combustivel,
      dataRealizado: type === 'concluded' ? humanizeDateTime(item.dataConclusao) : formatHour(item.createdAt),
      token: item.token
    }))

    const response = {
      emAndamento: normalize('pendent', pendentSupplies),
      concluido: normalize('concluded', concludedSupplies)
    }

    res.send(response)
  }
}
