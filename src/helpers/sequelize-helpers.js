const { Op } = require('sequelize')

module.exports = {
  buildRangeFilterQuery: (where, queryField, startValue, endValue) => {
    if (startValue && endValue) {
      return {
        ...where,
        [queryField]: {
          [Op.between]: [startValue, endValue]
        }
      }
    } else if (startValue) {
      return {
        ...where,
        [queryField]: {
          [Op.gt]: startValue
        }
      }
    } else if (endValue) {
      return {
        ...where,
        [queryField]: {
          [Op.or]: {
            [Op.lt]: endValue,
            [Op.eq]: endValue
          }
        }
      }
    }
  },

  buildPaginatedQuery: (where, { page, pageSize }) => {
    const offset = (parseInt(page) - 1) * pageSize
    return {
      where,
      offset: offset,
      limit: pageSize
    }
  }
}