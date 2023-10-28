const mysql = require('mysql2/promise')
const config = require('../config')

const connection = mysql.createPool({ 
    host: config.hostDB, 
    user: config.userDB, 
    password: config.passwordDB, 
    database: config.DB,
    waitForConnections: true
})

module.exports = connection