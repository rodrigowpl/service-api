const { Op } = require('sequelize')
const { Supply, GasStation, User, Company } = require('../models')

const { fixedNumberTwoDecimals } = require('../../helpers/number')
const { humanizeDateTime, formatHour } = require('../../helpers/date')
const { generateRandomToken } = require('../../helpers/token')

const { SUPPLY_STATUS } = require('../supplies/supply-status')
const { FUEL_TYPE } = require('../supplies/fuel_type')

const { BALANCE_TYPE } = require('../users/balance_type')

module.exports = {
  getAll: async (req, res) => {
    const { userId } = req.params

    const supplies = await Supply.findAll({
      where: { userId }
    })

    const suppliesTypes = {
      pendent: supplies.filter(({ status }) => status === SUPPLY_STATUS.PENDENT),
      concluded: supplies.filter(({ status }) => status === SUPPLY_STATUS.CONCLUDED)
    }

    const normalize = type => suppliesTypes[type].map(item => ({
      id: item.id,
      placa: item.placa,
      valor: item.valor,
      combustivel: item.combustivel,
      dataRealizado: type === 'concluded' ? humanizeDateTime(item.concludedDate) : formatHour(item.createdAt),
      token: item.token
    }))

    const response = {
      emAndamento: normalize('pendent'),
      concluido: normalize('concluded')
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

    if (supply.token !== token) {
      res.status(401).send({
        status: 401,
        result: 'Token inválido'
      })

      return
    }

    await supply.update({
      status: SUPPLY_STATUS.CONCLUDED,
      concludedDate: new Date()
    })

    const user = await User.findOne({
      where: { id: supply.user.id },
      include: [Company]
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
        [Op.or]: {
          id: supplyId,
          token: supplyId
        }
      }
    })

    if (!supply) {
      res.status(404).send('Abastecimento não existente')
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
        id: idAbastecimento,
        token
      }
    })

    if (!supply) {
      res.status(401).send({
        status: 401,
        result: 'Token inválido'
      })
      return
    }

    res.status(201).send()
  }
}
