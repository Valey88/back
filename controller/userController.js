const jwt = require('jsonwebtoken')
const hash = require('password-hash')
const connection = require('../database/db')
const jwt_token = require("./jwt")
const { secret } = require("../config.json")
const config = require('../config')

class User {
    async login(req, res){
        try {
            const { email, password } = req.body
            
            const connect = await connection;
            const [rows, fields] = await connect.execute('SELECT * FROM `users` WHERE `email` = ?', [email]);
            const expiredUser = rows[0]

            if (!expiredUser)
                throw new Error("Email не зарегистрирован")

            if (expiredUser.password !== password)
                throw new Error("Пароли не совпадают")

            const token_access = jwt.sign({ email: expiredUser.email }, secret, { expiresIn: "24h" })
            const token_refresh = jwt.sign({ id: expiredUser.id, role: expiredUser.role }, secret, { expiresIn: "30d" })
            return res.status(200).json({
                "tokenPair": {
                  "accessToken": token_access,
                  "refreshToken": token_refresh
                },
                "role": expiredUser.role
              })
        } catch (error) {
            return res.status(400).json({ message: error.message })
        }
    }

    async register(req, res){
        try {
            const { fio, phone, email, inn, name_org, adress, password } = req.body  

            const connect = await connection;
            const [rows, fields] = await connect.execute('SELECT * FROM `users` WHERE `email` = ?', [email]);
            const expiredUser = rows[0]
            if (expiredUser)
                throw new Error("Пользователь уже существует")

            await connection.execute("INSERT INTO `users` (`email`, `password`, `role`, `fio`, `phone`, `inn`, `name_org`, `adress`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [email, password, "admin_portal", fio, phone, inn, name_org, adress]);

            const token_access = jwt.sign({ email: email }, secret, { expiresIn: "24h" })
            const token_refresh = jwt.sign({ role: "admin_portal" }, secret, { expiresIn: "30d" })
            return res.status(200).json({
                "tokenPair": {
                  "accessToken": token_access,
                  "refreshToken": token_refresh
                },
                "role": "admin_portal"
              })
        } catch (error) {
            return res.status(400).json({ message: error.message })
        }
    }

    async infoByToken(req, res) {
        try {
            const token = req.headers.authorization
            const connect = await connection;
            const suspect = jwt.verify(token, secret)

            if (suspect === false)
                throw new Error("Неверный токен")

            const [rows, fields] = await connect.execute('SELECT `email`, `role`, `urlIcon`, `fio`, `phone`, `inn`, `name_org`, `adress` FROM `users` WHERE `email` = ?', [suspect.email]);
            const user = rows[0]
            if (user === false)
                throw new Error("Пользователя не существует")

            return res.status(200).json({ 
                "email": user.email,
                "role": user.role,
                "urlIcon": `${config.hostImage}/iconUser/${user.urlIcon}`,
                "fio": user.fio,
                "phone": user.phone, 
                "inn": user.inn, 
                "name_org": user.name_org, 
                "adress": user.adress 
            })
        } catch (error) {
            return res.status(400).json({ error: "Нету токена" })
        }
    }

    async profileIcon(req, res) {
        try {
            const token = await jwt_token(req.headers.authorization)
            if(token.role == "admin" || token.role == "admin_portal" || token.role == "employee" || token.role == "representative") {
                let random = Math.random() * (99999999999999 - 1111111) + 1111111;
                let name_file = `${random}_${req.files.icon.name}`
                req.files.icon.mv('public/iconUser/'+`${name_file}`);
                await connection.execute("UPDATE `users` SET `urlIcon`= ? WHERE `email` = ?", [name_file, token.email]);

                return res.status(200).json({ 
                    urlIcon: `${config.hostImage}/iconUser/${random}_${req.files.icon.name}`
                })
            }

            return res.status(400).json({ 
                error: "Не достаточно прав"
             })
        } catch (error) {
            return res.status(400).json({ error: error.message })
        }

    }

    async profileIconSet(req, res) {
        try {
            const token = await jwt_token(req.headers.authorization)
            if(token.role == "admin" || token.role == "admin_portal" || token.role == "employee" || token.role == "representative") {
                const id = req.params.id
                const [rows, fields] = await connection.execute("SELECT `urlIcon` FROM `users` WHERE `id` = ?", [id]);

                return res.status(200).json({ 
                    urlIcon: `${config.hostImage}/iconUser/${rows[0].urlIcon}`
                })
            }

            return res.status(400).json({ 
                error: "Не достаточно прав"
             })
        } catch (error) {
            return res.status(400).json({ error: error.message })
        }

    }
}

module.exports = new User()
