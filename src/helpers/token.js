const jwt = require('jsonwebtoken')

const { JWT_TOKEN_SECRET } = require('../config/settings')

module.exports = {
  generateJWTToken: (data) => {
    const token = jwt.sign({ data }, JWT_TOKEN_SECRET, { expiresIn: '30d' })
    return token
  }
}
