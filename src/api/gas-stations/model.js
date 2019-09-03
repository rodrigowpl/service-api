const { DataTypes } = require('sequelize')

const { ACTIVED } = require('../../helpers/constants')

module.exports = sequelize => (
  sequelize.define('gasStation', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV1
    },
    nome: {
      type: DataTypes.STRING
    },
    cidade: {
      type: DataTypes.STRING
    },
    bairro: {
      type: DataTypes.STRING
    },
    cnpj: {
      type: DataTypes.STRING
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
    logradouro: {
      type: DataTypes.STRING
    },
    horarioAtendimentoInicio: {
      type: DataTypes.DATE
    },
    horarioAtendimentoFim: {
      type: DataTypes.DATE
    },
    bandeira: {
      type: DataTypes.STRING
    },
    latitude: {
      type: DataTypes.DOUBLE
    },
    longitude: {
      type: DataTypes.DOUBLE
    },
    ativado: {
      type: DataTypes.INTEGER,
      defaultValue: ACTIVED
    }
  }, {
    tableName: 'gas_station',
    getterMethods: {
      endereco () {
        return `${this.logradouro}, ${this.bairro}, ${this.cidade}`
      }
    }
  })
)
