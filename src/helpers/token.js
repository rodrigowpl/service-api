const jwt = require('jsonwebtoken')

const { JWT_TOKEN_SECRET } = require('../config/settings')

module.exports = {
  generateJWTToken: (data) => {
    const token = jwt.sign({ data }, JWT_TOKEN_SECRET, { expiresIn: '30d' })
    return token
  },

  generateRandomToken: (length = 6) => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let result = ''
    for (let i = length; i > 0; --i) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }

    return result
  },

  generatePinCode: (length = 4) => Math.random().toString().substr(2, length)
}
