const { Supply, User, Company } = require('../models')

const { SUPPLY_STATUS } = require('../supplies/supply-status')

const { formatDate, formatHour } = require('../../helpers/date')
const { buildRangeFilterQuery, buildPaginatedQuery } = require('../../helpers/sequelize-helpers')

const ConfigurationController = require('../configurations/controller')

module.exports = {
  getAllSupplies: async (req, res) => {
    const {
      dataDe,
      dataAte,
      valorDe,
      valorAte,
      combustivel,
      pagamentoDe,
      pagamentoAte,
      page,
      pageSize
    } = req.query

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

    const { count, rows: supplies } = await Supply.findAndCountAll(
      buildPaginatedQuery(where, { page, pageSize })
    )

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

        if (!configuration) {
          res.status(422).send({
            code: 422,
            result: 'Nenhuma configuraçào cadastrada para essa empresa, posto ou tipo do combustível.'
          })
          return
        }

        return {
          numero: supply.codigo,
          data: formatDate(supply.dataConclusao),
          hora: formatHour(supply.dataConclusao),
          valor: `R$${supply.valor}`,
          combustivel: supply.combustivel,
          empresa: user.company.nome,
          taxaGasola: `${configuration.taxaGasola}%`,
          valorReceber: `R$${supply.valorTaxado}`,
          totalLitros: supply.totalLitros,
          prazoPagamento: `${configuration.prazoPagamentoGasola} dias úteis`,
          dataPagamento: supply.dataPagamento,
          usuario: user.nome
        }
      })
    )

    const response = {
      totalPaginas: Math.ceil(count / pageSize),
      abastecimentos: reportSupplies
    }

    res.send(response)
  }
}
