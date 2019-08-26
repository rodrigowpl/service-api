const { DataTypes } = require('sequelize')

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
    gasolina: {
      type: DataTypes.DOUBLE
    },
    diesel: {
      type: DataTypes.DOUBLE
    },
    etanol: {
      type: DataTypes.DOUBLE
    },
    ganhoGasolina: {
      type: DataTypes.DOUBLE
    },
    ganhoDiesel: {
      type: DataTypes.DOUBLE
    },
    ganhoEtanol: {
      type: DataTypes.DOUBLE
    }
  }, {
    tableName: 'gas_station'
  })
)
