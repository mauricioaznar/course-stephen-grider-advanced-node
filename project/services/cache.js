const mongoose = require('mongoose')
const redis = require('redis')
const util = require('util')
const keys = require('../config/keys')

const client = redis.createClient(keys.redisUrl)

const {promisify} = require('util')
client.hget = promisify(client.hget)

const exec = mongoose.Query.prototype.exec

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true
  this.hashKey = JSON.stringify(options.key || '')

  return this
}

mongoose.Query.prototype.exec = async function() {
  if (!this.useCache) {
    return exec.apply(this, arguments)
  }

  const key = JSON.stringify(Object.assign({}, this.getQuery(), {
    collection: this.mongooseCollection.name
  }))

  // See if we have a value for 'key' in redis
  const cacheValue = await client.hget(this.hashKey, key)

  // If we do, return that
  if (cacheValue) {
    // const doc = new this.model(JSON.parse(cacheValue))
    const doc = JSON.parse(cacheValue)
    return Array.isArray(doc)
      ? doc.map(d => new this.model(d))
      : new this.model(doc)
  }

  // Otherwise, issue the query and store the result in redis

  const result = await exec.apply(this, arguments)

  client.hmset(this.hashKey, key, JSON.stringify(result), 'EX', 10)

 return result
}

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey))
  }
}

// const redis = require('redis')


//
// // Do we have any cached data in redis related
// // to this query
// const cachedBlogs = await client.get(req.user.id)
//
// // if yes, then respond the request right away
// // and return
// if (cachedBlogs) {
//   console.log('SERVING FROM CACHE')
//   console.log(cachedBlogs)
//   return res.send(JSON.parse(cachedBlogs))
// }
//
// // if no, we neet to respond to request
// // and update our cache to store the data
//
// console.log('Serving from mongo')
// const blogs = await Blog.find({ _user: req.user.id });
//
// res.send(blogs);
//
// client.set(req.user.id, JSON.stringify(blogs))