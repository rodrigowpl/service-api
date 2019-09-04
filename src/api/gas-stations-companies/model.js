const { DataTypes } = require('sequelize')

module.exports = sequelize => (
  sequelize.define('gasStationCompany', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV1
    }
  }, {
    tableName: 'gas_station_company'
  })
)
