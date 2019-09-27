const { Op } = require('sequelize')
const { addDays, isToday, isSameMonth } = require('date-fns')
const camelCase = require('camelcase')
const numeral = require('numeral')

const { Supply, GasStation, User, Company } = require('../models')
const { ACCOUNT_TYPE } = require('../companies/account-type')

const { generateRandomToken, generatePinCode } = require('../../helpers/token')
const { humanizeDateTime } = require('../../helpers/date')
const { getCurrencyFormattedByCents, calcPercentage } = require('../../helpers/number')

const ConfigurationController = require('../configurations/controller')

const { SUPPLY_STATUS } = require('./supply-status')

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

    if (company.limiteGastoDiario) {
      const totalSpentCompanyToday = company.totalGastoDia + valor
      if (totalSpentCompanyToday > company.limiteGastoDiario || valor > company.limiteGastoDiario) {
        res.status(422).send({
          code: 422,
          result: 'O limite diário da sua empresa foi excedido.'
        })
        return
      }
    }

    if (user.limiteGastoDiario) {
      const totalSpentUserToday = user.totalGastoDia + valor
      if (totalSpentUserToday > user.limiteGastoDiario || valor > user.limiteGastoDiario) {
        res.status(422).send({
          code: 422,
          result: 'O seu limite diário foi excedido'
        })
        return
      }
    }

    if (user.limiteGastoMensal) {
      const totalSpentUserMonth = user.totalGastoMes + valor
      if (totalSpentUserMonth > user.limiteGastoMensal || valor > user.limiteGastoMensal) {
        res.status(422).send({
          code: 422,
          result: 'O seu limite mensal foi excedido'
        })
        return
      }
    }

    if (user.saldo) {
      if (valor > user.saldo) {
        res.status(422).send({
          code: 422,
          result: 'Você não tem saldo suficiente'
        })
        return
      }
    } else {
      if (company.tipoConta === ACCOUNT_TYPE.PRE) {
        if (valor > company.saldo) {
          res.status(422).send({
            code: 422,
            result: 'Sua empresa não tem saldo suficiente'
          })
          return
        }
      }
    }

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

    try {
      const supplyValue = numeral(valor).divide(100).value()
      const totalLiters = supplyValue / configuration.valorVenda
      const totalCredits = supplyValue * configuration.desconto

      console.log('supplyValue', supplyValue)
      console.log('totalLiters', totalLiters)
      console.log('totalCredits', totalCredits)

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
    } catch (err) {
      console.log('Erro:', err.message)

      res.status(500).send({
        code: 500,
        result: 'Ocorreu um erro ao tentar abastecer, por favor tente novamente mais tarde.'
      })
    }
  },

  performSupply: async (req, res) => {
    const { idAbastecimento, token } = req.body

    console.log('Peforming supply')
    console.log('idAbastacimento:', idAbastecimento)

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

    console.log('idUser:', user.id)

    const company = await Company.findOne({
      where: { id: user.companyId }
    })

    console.log('idEmpresa:', company.id)

    const configuration = await ConfigurationController.getConfiguration({
      fuelType: supply.combustivel,
      companyId: company.id,
      gasStationId: supply.gasStationId
    })

    console.log('idPosto:', supply.gasStationId)
    console.log('valor venda:', configuration.valorVenda)
    console.log('taxa gasola:', configuration.taxaGasola)

    if (!configuration) {
      res.status(422).send({
        code: 422,
        result: 'Nenhuma configuraçào cadastrada para a empresa do motorista, posto ou tipo do combustível.'
      })
      return
    }

    const valueDiscounted = calcPercentage(supply.valor, configuration.taxaGasola)
    const taxedValue = supply.valor - valueDiscounted

    console.log('valor discontado:', valueDiscounted)
    console.log('valor taxado:', taxedValue)

    const today = new Date()
    await supply.update({
      status: SUPPLY_STATUS.CONCLUDED,
      dataConclusao: today,
      prazoPagamento: configuration.prazoPagamentoGasola,
      dataPagamento: addDays(today, configuration.prazoPagamentoGasola),
      taxaGasola: configuration.taxaGasola,
      valorTaxado: taxedValue
    })

    console.log('créditos gerados:', supply.totalCreditos)
    console.log('valor abastecimento:', supply.valor)

    const supplyPrice = supply.valor - supply.totalCreditos

    console.log('preço abastecido', supplyPrice)

    try {
      if (company.tipoConta === ACCOUNT_TYPE.PRE) {
        await company.update({
          saldo: company.saldo - supplyPrice
        })
      }

      if (user.saldo) {
        await user.update({
          saldo: user.saldo - supplyPrice,
        })
      }

      if (isToday(company.dataUltimoAbastecimento)) {
        await company.update({
          totalGastoDia: company.totalGastoDia + supplyPrice,
          dataUltimoAbastecimento: today
        })
      } else {
        await company.update({
          totalGastoDia: supplyPrice,
          dataUltimoAbastecimento: today
        })
      }

      if (isToday(user.dataUltimoAbastecimento)) {
        await user.update({
          totalGastoDia: user.totalGastoDia + supplyPrice,
          dataUltimoAbastecimento: today
        })
      } else {
        await user.update({
          totalGastoDia: supplyPrice,
          dataUltimoAbastecimento: today
        })
      }

      if (isSameMonth(user.dataUltimoAbastecimento)) {
        await user.update({
          totalGastoMes: user.totalGastoMes + supplyPrice
        })
      } else {
        await user.update({
          totalGastoMes: supplyPrice
        })
      }
    } catch (err) {
      console.log(err.message)
      res.status(422).send({
        code: 422,
        result: 'Houve um erro ao tentar confirmar o abastecimento, por favor tente novamente.'
      })
      return
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
