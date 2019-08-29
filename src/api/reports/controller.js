const { Supply, Account, Company, User } = require('../models')

const { SUPPLY_STATUS } = require('../supplies/supply-status')

const { formatDate, formatHour, getUTCDate } = require('../../helpers/date')
const { buildRangeFilterQuery, buildPaginatedQuery } = require('../../helpers/sequelize-helpers')
const { fixedNumberTwoDecimals, calcPercentage } = require('../../helpers/number')

const ConfigurationController = require('../configurations/controller')

module.exports = {
  getAllSupplies: async (req, res) => {
    const {
      idConta,
      dataDe,
      dataAte,
      valorDe,
      valorAte,
      combustivel,
      dataPagamentoDe,
      dataPagamentoAte,
      page,
      pageSize
    } = req.query

    const account = await Account.findOne({
      where: { id: idConta }
    })

    let where = {
      status: SUPPLY_STATUS.CONCLUDED,
      gasStationId: account.gasStationId
    }

    if (dataDe || dataAte) {
      where = buildRangeFilterQuery(
        where,
        'data_conclusao',
        getUTCDate(dataDe),
        getUTCDate(dataAte)
      )
    }

    if (valorDe || valorAte) {
      where = buildRangeFilterQuery(where, 'valor', valorDe, valorAte)
    }

    if (dataPagamentoDe || dataPagamentoAte) {
      where = buildRangeFilterQuery(
        where,
        'data_pagamento',
        getUTCDate(dataPagamentoDe),
        getUTCDate(dataPagamentoAte)
      )
    }

    if (combustivel) {
      where = {
        ...where,
        combustivel
      }
    }

    const { count, rows: supplies } = await Supply.findAndCountAll({
      where,
      order: [['data_conclusao', 'DESC']],
      include: [User],
      ...buildPaginatedQuery({ page, pageSize })
    })

    const company = await Company.findOne({
      where: { id: account.companyId }
    })

    const reportSupplies = await Promise.all(
      supplies.map(async supply => {
        const configuration = await ConfigurationController.getConfiguration({
          fuelType: supply.combustivel,
          companyId: company.id,
          gasStationId: supply.gasStationId
        })

        if (!configuration) {
          res.status(422).send({
            code: 422,
            result: 'Nenhuma configuraçào cadastrada para essa empresa, posto ou tipo do combustível.'
          })
          return
        }

        const valueDiscounted = calcPercentage(supply.valor, configuration.taxaGasola)
        const taxedValue = fixedNumberTwoDecimals(supply.valor - valueDiscounted)

        return {
          numero: supply.codigo,
          data: formatDate(supply.dataConclusao),
          hora: formatHour(supply.dataConclusao),
          valor: `R$${supply.valor}`,
          combustivel: supply.combustivel,
          empresa: company.nome,
          taxaGasola: `${configuration.taxaGasola}%`,
          valorReceber: `R$${taxedValue}`,
          totalLitros: supply.totalLitros,
          prazoPagamento: `${configuration.prazoPagamentoGasola} dias úteis`,
          dataPagamento: formatDate(supply.dataPagamento),
          usuario: supply.user.nome
        }
      })
    )

    const response = {
      totalPaginas: Math.ceil(count / pageSize),
      abastecimentos: reportSupplies,
      total: count
    }

    res.send(response)
  }
}
