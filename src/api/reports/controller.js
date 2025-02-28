const { Op } = require('sequelize')

const { Supply, Account, Company, User, GasStation } = require('../models')

const { SUPPLY_STATUS } = require('../supplies/supply-status')

const { formatDate, formatHour, getUTCDate } = require('../../helpers/date')
const { buildRangeFilterQuery, buildPaginatedQuery } = require('../../helpers/sequelize-helpers')
const { getCurrencyFormattedByCents, formatMiles } = require('../../helpers/number')

module.exports = {
  getAllSupplies: async (req, res) => {
    const {
      idConta = '',
      idUsuario,
      dataDe,
      dataAte,
      valorDe,
      valorAte,
      combustivel,
      dataPagamentoDe,
      dataPagamentoAte,
      bandeira,
      page,
      pageSize
    } = req.query

    let where = {
      status: SUPPLY_STATUS.CONCLUDED
    }

    const account = await Account.findOne({
      where: { id: idConta }
    })

    if (account) {
      if (account.companyId) {
        const company = await Company.findOne({
          include: [{
            model: GasStation,
            as: 'gasStations'
          }],
          where: { id: account.companyId }
        })

        const allGasStationsIds = company.gasStations.map(({ id }) => id)
        if (allGasStationsIds.length > 0) {
          where = {
            ...where,
            gasStationId: {
              [Op.in]: allGasStationsIds
            }
          }
        }
      } else {
        where = {
          ...where,
          gasStationId: account.gasStationId
        }
      }
    }

    if (idUsuario) {
      where = {
        ...where,
        userId: idUsuario
      }
    }

    const startDate = getUTCDate(dataDe)
    const endDate = getUTCDate(dataAte)
    if (startDate || endDate) {
      where = buildRangeFilterQuery(
        where,
        'data_conclusao',
        startDate,
        endDate
      )
    }

    if (valorDe || valorAte) {
      where = buildRangeFilterQuery(where, 'valor', valorDe * 100, valorAte * 100)
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

    if (bandeira) {
      where = {
        ...where,
        bandeira: {
          [Op.iLike]: `%${bandeira}%`
        }
      }
    }

    const { count, rows: supplies } = await Supply.findAndCountAll({
      where,
      include: [User, GasStation],
      order: [['data_conclusao', 'DESC']],
      ...buildPaginatedQuery({ page, pageSize })
    })

    const reportSupplies = await Promise.all(
      supplies.map(async supply => {
        const user = supply.user
        const gasStation = supply.gasStation

        const companyUser = await Company.findOne({
          where: {
            id: user.companyId
          }
        })

        return {
          numero: supply.codigo,
          usuario: supply.usuario,
          placa: supply.placa,
          data: formatDate(supply.dataConclusao),
          hora: formatHour(supply.dataConclusao),
          valor: getCurrencyFormattedByCents(supply.valor),
          combustivel: supply.combustivel,
          totalCreditos: getCurrencyFormattedByCents(supply.totalCreditos),
          posto: supply.posto,
          cnpj: gasStation.cnpj,
          bandeiraPosto: supply.bandeira,
          enderecoPosto: supply.endereco,
          quilometragem: formatMiles(supply.km),
          empresa: companyUser.nome,
          taxaGasola: `${supply.taxaGasola}%`,
          totalLitros: supply.totalLitros.toFixed(2),
          valorReceber: getCurrencyFormattedByCents(supply.valorTaxado),
          prazoPagamento: `${supply.prazoPagamento} dias`,
          dataPagamento: formatDate(supply.dataPagamento),
          geoLocalizacaoPosto: `${gasStation.latitude} ${gasStation.longitude}`
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
