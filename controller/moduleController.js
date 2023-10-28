const connection = require('../database/db')
const Token = require("./jwt")
const config = require("../config") 

class Module {
    async modules(req, res) {
        try {
            const connect = await connection
            const [data, fields] = await connect.execute('SELECT * FROM `module` WHERE 1')
            return res.status(200).json({ data })
        } catch (error) {
            return res.status(400).json({ error: error.message })
        }
    }

    async module(req, res) {
        try {
            const name =  req.params.name_id
            const connect = await connection
            const [rows, fields] = await connect.execute('SELECT * FROM `module` WHERE `name` = ?', [name])
            let modules = rows[0]
            return res.status(200).json({ 
                "name": modules.name,
                "urlFile": `${config.hostImage}/module/${modules.urlFile}`,
             })
        } catch (error) {
            return res.status(400).json({ error: error.message })
        }
    }

    async module_create(req, res) {
        try {
            const { name } = req.body
            let token = await Token(req.headers.authorization)

            if(token.role == "admin" || token.role == "admin_portal" || token.role == "employee" || token.role == "representative") {
                let random = Math.random() * (99999999999999 - 1111111) + 1111111;
                let name_file = `${random}_${req.files.file.name}`
                req.files.file.mv('public/module/'+`${random}_${name_file}`);
                await connection.execute("INSERT INTO `module` (`name`, `urlFile`) VALUES (?, ?)", [name, name_file]);

                return res.status(200).json({ 
                    name: name, 
                    urlFile: `${config.hostImage}/module/${random}_${req.files.file.name}`
                })
            }

            return res.status(400).json({ 
               error: "Не достаточно прав"
            })
        } catch (error) {
            return res.status(400).json({ error: "Нету токена" })
        }
    }
}

module.exports = new Module()