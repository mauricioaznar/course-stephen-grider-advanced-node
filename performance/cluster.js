const cluster = require('cluster')


// Is the file being executed in the master mode?
if (cluster.isMaster) {
  // Cause index.js to be executed *again* but
  // in child mode
  cluster.fork()
} else {
  // Im a child, Im going to act like a server
  // and do nothing else
  const express = require('express')
  const crypto = require('crypto')
  const app = express()



  app.get('/', (req, res) => {
    crypto.pbkdf2('a', 'b', 100000,  512,'sha512', () => {
      res.send('hi there')
    })
  })

  app.get('/fast', (req, res) => {
    res.send('This was fast')
  })


  app.listen(3000, () => {
    console.log('App listening on', 3000)
  })
}
