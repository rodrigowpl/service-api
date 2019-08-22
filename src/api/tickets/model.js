const { DataTypes } = require('sequelize')

const { FUEL_TYPE } = require('./fuel_type')

module.exports = sequelize => (
  sequelize.define('ticket', {
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
    valor: DataTypes.DOUBLE,
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  }, {
    tableName: 'ticket'
  })
)
