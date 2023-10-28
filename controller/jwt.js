const connection = require('../database/db')
const jwt = require('jsonwebtoken')
const { secret } = require("../config.json")

async function Token(token) {
    try {
        const connect = await connection;
        const suspect = jwt.verify(token, secret)

        if (suspect === false)
            return {"error": "Неверный токен"}

        const [rows, fields] = await connect.execute('SELECT `email`, `role`, `urlIcon` FROM `users` WHERE `email` = ?', [suspect.email]);
        const user = rows[0]
        if (user === false)
            return {"error":"Пользователя не существует"}

        return { 
            "email": user.email,
            "role": user.role,
            "urlIcon": user.urlIcon 
        }
    } catch (error) {
        return { error: "Нету токена" }
    }
}

module.exports = Token