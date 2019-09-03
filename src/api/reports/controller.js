const { Op } = require('sequelize')

const { Supply, Account, Company, User, GasStation } = require('../models')

const { SUPPLY_STATUS } = require('../supplies/supply-status')

const { formatDate, formatHour, getUTCDate } = require('../../helpers/date')
const { buildRangeFilterQuery, buildPaginatedQuery } = require('../../helpers/sequelize-helpers')
const { calcPercentage, getCurrencyFormattedByCents, formatMiles } = require('../../helpers/number')

const ConfigurationController = require('../configurations/controller')

module.exports = {
  getAllSupplies: async (req, res) => {
    const {
      idConta,
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

    const account = await Account.findOne({
      where: { id: idConta },
      include: [{
        model: GasStation,
        as: 'gasStations'
      }]
    })

    let where = {
      status: SUPPLY_STATUS.CONCLUDED
    }

    const allGasStationsIds = account.gasStations.map(({ id }) => id)
    if (allGasStationsIds.length > 0) {
      where = {
        ...where,
        gasStationId: {
          [Op.in]: allGasStationsIds
        }
      }
    } else {
      where = {
        ...where,
        gasStationId: account.gasStationId
      }
    }

    if (idUsuario) {
      where = {
        ...where,
        userId: idUsuario
      }
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
        const configuration = await ConfigurationController.getGasStationConfiguration({
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

        const gasStation = supply.gasStation
        const user = supply.user

        const { company } = await Account.findOne({
          include: [Company],
          where: {
            id: user.accountId
          }
        })

        const valueDiscounted = calcPercentage(supply.valor, configuration.taxaGasola)
        const taxedValue = supply.valor - valueDiscounted

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
          bandeiraPosto: supply.bandeira,
          enderecoPosto: supply.endereco,
          quilometragem: formatMiles(supply.km),
          empresa: company.nome,
          taxaGasola: `${configuration.taxaGasola}%`,
          totalLitros: supply.totalLitros.toFixed(2),
          valorReceber: getCurrencyFormattedByCents(taxedValue),
          prazoPagamento: `${configuration.prazoPagamentoGasola} dias`,
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
