const { Op } = require('sequelize')
const { addDays } = require('date-fns')
const camelCase = require('camelcase')

const { Supply, GasStation, User, Account } = require('../models')

const { generateRandomToken, generatePinCode } = require('../../helpers/token')
const { humanizeDateTime } = require('../../helpers/date')
const { getCurrencyFormattedByCents } = require('../../helpers/number')

const { BALANCE_TYPE } = require('../users/balance-type')

const ConfigurationController = require('../configurations/controller')

const { SUPPLY_STATUS } = require('./supply-status')
const { FUEL_TYPE } = require('./fuel_type')

module.exports = {
  create: async (req, res) => {
    const { idUsuario, idPosto, valor, combustivel, km, placa } = req.body

    const token = generateRandomToken()

    const gasStation = await GasStation.findOne({
      where: { id: idPosto }
    })

    const fuelValues = {
      [FUEL_TYPE.GASOLINE]: {
        fuelValue: gasStation.gasolina,
        fuelCredit: gasStation.ganhoGasolina
      },
      [FUEL_TYPE.ETHANOL]: {
        fuelValue: gasStation.etanol,
        fuelCredit: gasStation.ganhoEtanol
      },
      [FUEL_TYPE.DIESEL]: {
        fuelValue: gasStation.diesel,
        fuelCredit: gasStation.ganhoDiesel
      }
    }

    const { fuelValue, fuelCredit } = fuelValues[combustivel]

    const totalLiters = valor / fuelValue
    const totalCredits = Math.round((totalLiters * fuelCredit) * 100)

    const supply = await Supply.create({
      codigo: generatePinCode(8),
      userId: idUsuario,
      gasStationId: idPosto,
      valor,
      combustivel,
      km,
      placa,
      token,
      totalLitros: totalLiters,
      totalCreditos: totalCredits
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

    const account = await Account.findOne({
      where: { id: user.accountId }
    })

    const configuration = await ConfigurationController.getGasStationConfiguration({
      fuelType: supply.combustivel,
      gasStationId: supply.gasStationId
    })

    if (!configuration) {
      res.status(422).send({
        code: 422,
        result: 'Nenhuma configuraçào cadastrada para esse posto ou tipo do combustível.'
      })
      return
    }

    const today = new Date()
    await supply.update({
      status: SUPPLY_STATUS.CONCLUDED,
      dataConclusao: today,
      dataPagamento: addDays(today, configuration.prazoPagamentoGasola),
    })

    const subtractValue = supply.valor - supply.totalCreditos

    if (user.tipoSaldo === BALANCE_TYPE.SHARED) {
      await account.update({
        saldo: account.saldo - subtractValue
      })
    }

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
