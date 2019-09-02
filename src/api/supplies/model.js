const { DataTypes } = require('sequelize')

const { FUEL_TYPE } = require('./fuel_type')
const { SUPPLY_STATUS } = require('./supply-status')

module.exports = sequelize => (
  sequelize.define('supply', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV1
    },
    codigo: {
      type: DataTypes.INTEGER
    },
    token: {
      type: DataTypes.STRING
    },
    combustivel: {
      type: DataTypes.STRING,
      defaultType: FUEL_TYPE.GASOLINE
    },
    placa: {
      type: DataTypes.STRING
    },
    km: {
      type: DataTypes.STRING
    },
    valor: {
      type: DataTypes.INTEGER
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: SUPPLY_STATUS.PENDENT
    },
    totalLitros: {
      type: DataTypes.DOUBLE
    },
    totalCreditos: {
      type: DataTypes.INTEGER
    },
    dataConclusao: {
      type: DataTypes.DATE
    },
    dataPagamento: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'supply'
  })
)
