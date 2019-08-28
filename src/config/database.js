const {
  DB_USER_NAME,
  DB_PASSWORD,
  DB_HOST,
  DB_NAME
} = require('./settings')

module.exports = {
  CONNECTION_STRING: `postgres://${DB_USER_NAME}:${DB_PASSWORD}@${DB_HOST}:5432/${DB_NAME}`,
  DB_OPTIONS: {
    dialectOptions: {
      useUTC: false
    },
    define: {
      timestamps: true,
      underscored: true
    },
    logging: false,
    timezone: 'America/Sao_Paulo'
  }
}
