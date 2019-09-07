const { DataTypes } = require('sequelize')

const { ACTIVED } = require('../../helpers/constants')

const { ACCOUNT_PROFILE } = require('./account-profile')

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
    usuario: {
      type: DataTypes.STRING
    },
    senha: {
      type: DataTypes.STRING
    },
    ativado: {
      type: DataTypes.INTEGER,
      defaultValue: ACTIVED
    },
    perfil: {
      type: DataTypes.STRING,
      defaultValue: ACCOUNT_PROFILE.NORMAL
    }
  }, {
    tableName: 'account'
  })
)
