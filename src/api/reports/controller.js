const { Op } = require('sequelize')

const { Supply, User, Company } = require('../models')

const { SUPPLY_STATUS } = require('../supplies/supply-status')

const { formatDate, formatHour } = require('../../helpers/date')

const buildRangeFilterQuery = (where, queryField, startValue, endValue) => {
  if (startValue && endValue) {
    return {
      ...where,
      [queryField]: {
        [Op.between]: [startValue, endValue]
      }
    }
  } else if (startValue) {
    return {
      ...where,
      [queryField]: {
        [Op.gt]: startValue
      }
    }
  } else if (endValue) {
    return {
      ...where,
      [queryField]: {
        [Op.or]: {
          [Op.lt]: endValue,
          [Op.eq]: endValue
        }
      }
    }
  }
}

module.exports = {
  getAllSupplies: async (req, res) => {
    const { dataDe, dataAte, valorDe, valorAte, combustivel, pagamentoDe, pagamentoAte, idEmpresa } = req.query

    let where = {
      status: SUPPLY_STATUS.CONCLUDED
    }

    if (dataDe || dataAte) {
      where = buildRangeFilterQuery(where, 'concluded_date', dataDe, dataAte)
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
      numero: '00000',
      data: formatDate(supply.concludedDate),
      hora: formatHour(supply.concludedDate),
      valor: supply.valor,
      combustivel: supply.combustivel,
      empresa: supply.user.company.nome,
      taxaGasola: 0.00,
      valorReceber: 0.00,
      totalLitros: supply.totalLitros,
      prazoPagamento: 0,
      dataPagamento: '00/00/0000',
      usuario: supply.user.nome
    }))

    res.send(reportSupplies)
  }
}
