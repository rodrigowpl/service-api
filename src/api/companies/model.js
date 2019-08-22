const { DataTypes } = require('sequelize')

module.exports = sequelize => (
  sequelize.define('company', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV1
    },
    nome: DataTypes.STRING,
    saldo: {
      type: DataTypes.DOUBLE,
      defaultValue: 0
    }
  }, {
    tableName: 'company'
  })
)
