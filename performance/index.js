const express = require('express')
const crypto = require('crypto')
const app = express()


// PM2 is used to handle clustering efficiently


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