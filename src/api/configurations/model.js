const { DataTypes } = require('sequelize')

module.exports = sequelize => (
  sequelize.define('configuration', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV1
    },
    combustivel: {
      type: DataTypes.STRING
    },
    valorVenda: {
      type: DataTypes.DOUBLE
    },
    taxaGasola: {
      type: DataTypes.DOUBLE
    },
    prazoPagamentoGasola: {
      type: DataTypes.INTEGER
    },
    prazoPagamentoCliente: {
      type: DataTypes.INTEGER
    },
    desconto: {
      type: DataTypes.DOUBLE
    },
    ativado: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  }, {
    tableName: 'configuration'
  })
)
