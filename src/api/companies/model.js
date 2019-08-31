const { DataTypes } = require('sequelize')

const { ACTIVED } = require('../../helpers/constants')

module.exports = sequelize => (
  sequelize.define('company', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV1
    },
    nome: {
      type: DataTypes.STRING
    },
    ativado: {
      type: DataTypes.INTEGER,
      defaultValue: ACTIVED
    }
  }, {
    tableName: 'company'
  })
)
