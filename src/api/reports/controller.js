const { Supply, User, Company } = require('../models')

const { SUPPLY_STATUS } = require('../supplies/supply-status')

const { formatDate, formatHour } = require('../../helpers/date')
const { buildRangeFilterQuery } = require('../../helpers/sequelize-queries')
const { calcPercentage, fixedNumberTwoDecimals } = require('../../helpers/number')

const ConfigurationController = require('../configurations/controller')

module.exports = {
  getAllSupplies: async (req, res) => {
    const { dataDe, dataAte, valorDe, valorAte, combustivel, pagamentoDe, pagamentoAte } = req.query

    let where = {
      status: SUPPLY_STATUS.CONCLUDED
    }

    if (dataDe || dataAte) {
      where = buildRangeFilterQuery(where, 'data_conclusao', dataDe, dataAte)
    }

    if (valorDe || valorAte) {
      where = buildRangeFilterQuery(where, 'valor', valorDe, valorAte)
    }

    if (pagamentoDe || pagamentoAte) {
      where = buildRangeFilterQuery(where, 'data_pagamento', pagamentoDe, pagamentoAte)
    }

    if (combustivel) {
      where = {
        ...where,
        combustivel
      }
    }

    const supplies = await Supply.findAll({ where })

    const reportSupplies = await Promise.all(
      supplies.map(async supply => {
        const user = await User.findOne({
          where: { id: supply.userId },
          include: [Company]
        })

        const configuration = await ConfigurationController.getConfiguration({
          fuelType: supply.combustivel,
          companyId: user.company.id,
          gasStationId: supply.gasStationId
        })

        const valueDiscounted = calcPercentage(supply.valor, configuration.taxaGasola)
        const receivedValue = fixedNumberTwoDecimals(supply.valor - valueDiscounted)

        return {
          numero: supply.codigo,
          data: formatDate(supply.dataConclusao),
          hora: formatHour(supply.dataConclusao),
          valor: `R$${supply.valor}`,
          combustivel: supply.combustivel,
          empresa: user.company.nome,
          taxaGasola: `${configuration.taxaGasola}%`,
          valorReceber: `R$${receivedValue}`,
          totalLitros: supply.totalLitros,
          prazoPagamento: `${configuration.prazoPagamentoGasola} dias úteis`,
          dataPagamento: formatDate(supply.dataConclusao, configuration.prazoPagamentoGasola),
          usuario: user.nome
        }
      })
    )

    res.send(reportSupplies)
  }
}
