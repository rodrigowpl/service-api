const { Op } = require('sequelize')

const { Supply, User, Company } = require('../models')

const { SUPPLY_STATUS } = require('../supplies/supply-status')

const { formatDate, formatHour } = require('../../helpers/date')
const { buildRangeFilterQuery } = require('../../helpers/sequelize-queries')

module.exports = {
  getAllSupplies: async (req, res) => {
    const { dataDe, dataAte, valorDe, valorAte, combustivel, pagamentoDe, pagamentoAte, idEmpresa } = req.query

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

    const supplies = await Supply.findAll({
      where,
      include: [{
        model: User,
        include: [{
          model: Company,
          where: {
            id: {
              [Op.eq]: idEmpresa
            }
          }
        }]
      }],
    })

    const reportSupplies = supplies.map(supply => ({
      numero: supply.codigo,
      data: formatDate(supply.dataConclusao),
      hora: formatHour(supply.dataConclusao),
      valor: `R$${supply.valor}`,
      combustivel: supply.combustivel,
      empresa: supply.user.company.nome,
      taxaGasola: `${0.00}%`,
      valorReceber: `R$${0.00}`,
      totalLitros: supply.totalLitros,
      prazoPagamento: `${0} dias úteis`,
      dataPagamento: '00/00/0000',
      usuario: supply.user.nome
    }))

    res.send(reportSupplies)
  }
}
