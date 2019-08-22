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
    token: DataTypes.STRING,
    combustivel: {
      type: DataTypes.STRING,
      defaultType: FUEL_TYPE.GASOLINE
    },
    placa: DataTypes.STRING,
    km: DataTypes.STRING,
    valor: DataTypes.DOUBLE,
    status: {
      type: DataTypes.INTEGER,
      defaultValue: SUPPLY_STATUS.PENDENT
    },
    totalLitros: DataTypes.DOUBLE,
    totalCreditos: DataTypes.DOUBLE,
    concludedDate: DataTypes.DATE
  }, {
    tableName: 'supply'
  })
)
