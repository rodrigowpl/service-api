const { DataTypes } = require('sequelize')

module.exports = sequelize => (
  sequelize.define('user', {
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
      type: DataTypes.STRING
    },
    perfil: {
      type: DataTypes.STRING,
      defaultValue: 'motorista'
    }
  }, {
    tableName: 'user'
  })
)
