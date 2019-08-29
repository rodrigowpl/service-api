const { DataTypes } = require('sequelize')

module.exports = sequelize => (
  sequelize.define('account', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV1
    },
    nome: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING
    },
    senha: {
      type: DataTypes.STRING
    },
    telefone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    banco: {
      type: DataTypes.STRING
    },
    agencia: {
      type: DataTypes.STRING
    },
    conta: {
      type: DataTypes.STRING
    }
  }, {
    tableName: 'account'
  })
)
