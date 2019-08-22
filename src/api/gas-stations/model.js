const { DataTypes } = require('sequelize')

module.exports = sequelize => (
  sequelize.define('gas_station', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV1
    },
    nome: DataTypes.STRING,
    logradouro: DataTypes.STRING,
    horarioAtendimentoInicio: DataTypes.DATE,
    horarioAtendimentoFim: DataTypes.DATE,
    bandeira: DataTypes.STRING,
    latitude: DataTypes.DOUBLE,
    longitude: DataTypes.DOUBLE,
    gasolina: DataTypes.DOUBLE,
    diesel: DataTypes.DOUBLE,
    etanol: DataTypes.DOUBLE,
    ganhoGasolina: DataTypes.DOUBLE,
    ganhoDiesel: DataTypes.DOUBLE,
    ganhoEtanol: DataTypes.DOUBLE
  }, {
    tableName: 'gas_station'
  })
)
