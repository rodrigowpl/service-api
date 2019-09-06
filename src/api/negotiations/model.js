const { DataTypes } = require('sequelize')

const { ACTIVED } = require('../../helpers/constants')

module.exports = sequelize => (
  sequelize.define('negotiation', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV1
    },
    descricao: {
      type: DataTypes.STRING
    },
    url: {
      type: DataTypes.STRING
    },
    ativado: {
      type: DataTypes.INTEGER,
      defaultValue: ACTIVED
    }
  }, {
    tableName: 'negotiation'
  })
)
