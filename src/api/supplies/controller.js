const { Op } = require('sequelize')
const { addDays, isToday, isSameMonth } = require('date-fns')
const camelCase = require('camelcase')

const { Supply, GasStation, User, Account, Company } = require('../models')

const { generateRandomToken, generatePinCode } = require('../../helpers/token')
const { humanizeDateTime } = require('../../helpers/date')
const { getCurrencyFormattedByCents, calcPercentage } = require('../../helpers/number')

const ConfigurationController = require('../configurations/controller')

const { SUPPLY_STATUS } = require('./supply-status')

const validateSupplyLimit = async ({ basis, model, supplyValue, message }, res) => {
  const totalSuppliedValue = model.totalGastoDia + supplyValue

  const isPeriodValidation = {
    'daily': isToday,
    'monthly': isSameMonth
  }

  if (isPeriodValidation[basis](model.dataUltimoAbastecimento)) {
    if (totalSuppliedValue > model.limiteGastoDiario) {
      res.status(422).send({
        code: 422,
        result: message
      })
      return
    }
  } else {
    if (supplyValue > model.limiteGastoDiario) {
      res.status(422).send({
        code: 422,
        result: message
      })
      return
    } else {
      const today = new Date()
      await model.update({
        dataUltimoAbastecimento: today,
        totalGastoDia: 0
      })
    }
  }
}

module.exports = {
  create: async (req, res) => {
    const { idUsuario, idPosto, valor, combustivel, km, placa } = req.body

    const token = generateRandomToken()

    const gasStation = await GasStation.findOne({
      where: { id: idPosto }
    })

    const user = await User.findOne({
      where: { id: idUsuario }
    })

    const company = await Company.findOne({
      where: { id: user.companyId }
    })

    validateSupplyLimit({
      basis: 'daily',
      model: company,
      supplyValue: valor,
      message: 'O limite diário da sua empresa foi excecido.'
    }, res)

    validateSupplyLimit({
      basis: 'daily',
      model: user,
      supplyValue: valor,
      message: 'O seu limite diário foi excecido'
    }, res)

    validateSupplyLimit({
      basis: 'monthly',
      model: user,
      supplyValue: valor,
      message: 'O seu limite mensal foi excecido'
    }, res)

    const configuration = await ConfigurationController.getConfiguration({
      fuelType: combustivel,
      companyId: company.id,
      gasStationId: gasStation.id
    })

    if (!configuration) {
      res.status(422).send({
        code: 422,
        result: 'Nenhuma configuraçào cadastrada para a empresa do motorista, posto ou tipo do combustível.'
      })
      return
    }

    const totalLiters = valor / configuration.valorVenda
    const totalCredits = Math.round((totalLiters * configuration.desconto) * 100)

    const supply = await Supply.create({
      codigo: generatePinCode(8),
      userId: user.id,
      gasStationId: idPosto,
      valor,
      combustivel,
      km,
      placa,
      token,
      totalLitros: totalLiters,
      totalCreditos: totalCredits,
      usuario: user.nome,
      posto: gasStation.nome,
      bandeira: gasStation.bandeira,
      endereco: gasStation.endereco,
    })

    const response = {
      token,
      status: supply.status
    }

    res.send(response)
  },

  performSupply: async (req, res) => {
    const { idAbastecimento, token } = req.body

    const supply = await Supply.findOne({
      where: { id: idAbastecimento },
      include: [User]
    })

    if (supply.status === SUPPLY_STATUS.CANCELED) {
      res.status(422).send({
        status: 422,
        result: 'Abastecimento já foi cancelado'
      })
      return
    }

    if (supply.token !== token) {
      res.status(401).send({
        status: 401,
        result: 'Token inválido'
      })
      return
    }

    const user = await User.findOne({
      where: { id: supply.user.id }
    })

    const company = await Account.findOne({
      where: { accountId: user.accountId }
    })

    const configuration = await ConfigurationController.getConfiguration({
      fuelType: supply.combustivel,
      companyId: company.id,
      gasStationId: supply.gasStationId
    })

    if (!configuration) {
      res.status(422).send({
        code: 422,
        result: 'Nenhuma configuraçào cadastrada para a empresa do motorista, posto ou tipo do combustível.'
      })
      return
    }

    const valueDiscounted = calcPercentage(supply.valor, configuration.taxaGasola)
    const taxedValue = supply.valor - valueDiscounted

    const today = new Date()
    await supply.update({
      status: SUPPLY_STATUS.CONCLUDED,
      dataConclusao: today,
      prazoPagamento: configuration.prazoPagamentoGasola,
      dataPagamento: addDays(today, configuration.prazoPagamentoGasola),
      taxaGasola: configuration.taxaGasola,
      valorTaxado: taxedValue
    })

    const supplyPrice = supply.valor - supply.totalCreditos

    if (user.saldo) {
      await user.update({
        saldo: user.saldo - supplyPrice
      })
    } else {
      await company.update({
        saldo: company.saldo - supplyPrice
      })
    }

    await company.update({
      totalGastoDia: company.totalGastoDia + supplyPrice
    })

    await user.update({
      totalGastoDia: user.totalGastoDia + supplyPrice
    })

    res.send('Abastecimento efetuado com sucesso.')
  },

  cancelSupply: async (req, res) => {
    const { supplyId } = req.params

    const supply = await Supply.findOne({
      where: {
        status: SUPPLY_STATUS.PENDENT,
        [Op.or]: {
          id: supplyId,
          token: supplyId
        }
      }
    })

    if (!supply) {
      res.status(422).send({
        code: 422,
        result: 'Abastecimento já foi confirmado ou não existe'
      })
      return
    }

    await supply.update({
      status: SUPPLY_STATUS.CANCELED
    })

    res.send('Abastecimento cancelado com sucesso.')
  },

  getStatus: async (req, res) => {
    const { tokenId } = req.params

    const { token, status } = await Supply.findOne({
      where: { token: tokenId }
    })

    res.send({ token, status })
  },


  validateToken: async (req, res) => {
    const { idAbastecimento, token } = req.body

    const supply = await Supply.findOne({
      where: {
        id: idAbastecimento
      }
    })

    if (supply.status === SUPPLY_STATUS.CANCELED) {
      res.status(422).send({
        status: 422,
        result: 'Abastecimento já foi cancelado'
      })
      return
    }

    if (supply.token !== token) {
      res.status(401).send({
        status: 401,
        result: 'Token inválido'
      })
      return
    }

    res.status(200).send({ isValid: true })
  },

  getSuppliesHistoryByUser: async (req, res) => {
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
        totalLitros: `${totalLitros.toFixed(2)} litros`,
        valorAbastecimento: getCurrencyFormattedByCents(valor),
        valorEmCreditos: `${getCurrencyFormattedByCents(totalCreditos)} ganho em créditos`
      }
    })

    res.send(history)
  }
}
