const { DataTypes } = require('sequelize')

const { ACCOUNT_TYPE } = require('./account-type')
const { BALANCE_TYPE } = require('./balance-type')

module.exports = sequelize => (
  sequelize.define('user', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV1
    },
    codigo: {
      type: DataTypes.STRING
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
    cpf: {
      type: DataTypes.STRING
    },
    placa: {
      type: DataTypes.STRING,
      allowNull: true
    },
    telefone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tipoConta: {
      type: DataTypes.STRING,
      defaultValue: ACCOUNT_TYPE.PRE
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
      defaultValue: BALANCE_TYPE.SHARED
    }
  }, {
    tableName: 'user'
  })
)
