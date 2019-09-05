const { DataTypes } = require('sequelize')

const { ACTIVED } = require('../../helpers/constants')

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
    ativado: {
      type: DataTypes.INTEGER,
      defaultValue: ACTIVED
    },
    saldo: {
      type: DataTypes.INTEGER
    },
    limiteGastoDiario: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    limiteGastoMensal: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    dataUltimoAbastecimento: {
      type: DataTypes.DATE
    },
    totalGastoDia: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    totalGastoMes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'user'
  })
)
