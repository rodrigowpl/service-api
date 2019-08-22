const { DataTypes } = require('sequelize')

const { ACCOUNT_TYPE } = require('./account_type')
const { BUDGET_TYPE } = require('./budget_type')

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
    },
    tipoConta: {
      type: DataTypes.STRING,
      defaultValue: ACCOUNT_TYPE.POS
    },
    ativado: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    saldo: {
      type: DataTypes.DOUBLE,
      defaultValue: 0
    },
    tipoSaldo: {
      type: DataTypes.STRING,
      default: BUDGET_TYPE.PERSONAL
    }
  }, {
    tableName: 'user'
  })
)
