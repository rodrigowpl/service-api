const { Op } = require('sequelize')
const { startOfDay, endOfDay, addDays } = require('date-fns')

const { Supply, GasStation, User, Company } = require('../models')

const { fixedNumberTwoDecimals } = require('../../helpers/number')
const { humanizeDateTime, formatHour } = require('../../helpers/date')
const { generateRandomToken, generatePinCode } = require('../../helpers/token')

const { SUPPLY_STATUS } = require('../supplies/supply-status')
const { FUEL_TYPE } = require('../supplies/fuel_type')

const { BALANCE_TYPE } = require('../users/balance-type')

const ConfigurationController = require('../configurations/controller')

module.exports = {
  getAll: async (req, res) => {
    const { userId } = req.params

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

    const response = {
      emAndamento: normalize('pendent', pendentSupplies),
      concluido: normalize('concluded', concludedSupplies)
    }

    res.send(response)
  },

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

    const supplyValue = parseFloat(valor)
    const { fuelValue, fuelCredit } = fuelValues[combustivel]

    const totalLiters = fixedNumberTwoDecimals(supplyValue / fuelValue)
    const totalCredits = fixedNumberTwoDecimals(totalLiters * fuelCredit)

    const supply = await Supply.create({
      codigo: generatePinCode(8),
      userId: idUsuario,
      gasStationId: idPosto,
      valor: supplyValue,
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
      where: { id: supply.user.id },
      include: [Company]
    })

    const configuration = await ConfigurationController.getConfiguration({
      companyId: user.companyId,
      fuelType: supply.combustivel,
      gasStationId: supply.gasStationId
    })

    if (!configuration) {
      res.status(422).send({
        code: 422,
        result: 'Nenhuma configuraçào cadastrada para essa empresa, posto ou tipo do combustível.'
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
      const company = await Company.findOne({
        where: { id: user.company.id }
      })

      await company.update({
        saldo: company.saldo - subtractValue
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
      res.send('Abastecimento não existente ou já foi confirmado.')
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
  }
}
