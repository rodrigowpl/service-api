const { DataTypes } = require('sequelize')

const { ACCOUNT_TYPE } = require('./account-type')

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
    cnpj: {
      type: DataTypes.STRING
    },
    saldo: {
      type: DataTypes.DOUBLE
    },
    limiteGastoDiario: {
      type: DataTypes.INTEGER
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
    },
    tipoConta: {
      type: DataTypes.STRING,
      defaultValue: ACCOUNT_TYPE.PRE
    },
    dataUltimoAbastecimento: {
      type: DataTypes.DATE
    },
    totalGastoDia: {
      type: DataTypes.DOUBLE,
      defaultValue: 0
    },
    ativado: {
      type: DataTypes.INTEGER,
      defaultValue: ACTIVED
    },
  }, {
    tableName: 'company'
  })
)
