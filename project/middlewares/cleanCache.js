const {clearHash} = require('../services/cache')

module.exports = async (req, res, next) => {
  // make sure the route handle does whaterver needs to to
  // and return to this function
  await next()

  clearHash(req.user.id)
}