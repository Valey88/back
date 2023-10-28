const connection = require('../database/db')

class Test {
    async isTestReadyName(req, res) {
        try {
            const connect = await connection
            const [rows, fields] = await connect.execute('SELECT `id`, `name_test` FROM `test` WHERE 1')
            return res.status(200).json({ data: rows })
        } catch (error) {
            return res.status(400).json({ data: error.message })
        }
    }

    async isTestReady(req, res) {
        try {
            const id = req.params.id
            const connect = await connection
            const [rows, fields] = await connect.execute('SELECT `id`, `name_test`, `quest` FROM `test` WHERE `id` = ?',[id])
            return res.status(200).json({ data: rows })
        } catch (error) {
            return res.status(400).json({ data: error.message })
        }
    }

    async isTestResult(req, res) {
        const {id, name, result} = req.body
        
        const connect = await connection
        const [rows, fields] = await connect.execute('SELECT `verify_answer` FROM `test` WHERE `id` = ?', [id])
        const verify_answer = JSON.parse(rows[0]['verify_answer'])
        let number = 0

        for (let index = 0; index < verify_answer.length; index++) {
            if(result[index] === verify_answer[index]) {
                number++
            }
        }

        if(number > 1) {
            await connect.execute('INSERT INTO `result`(`name`, `result`, `status`) VALUES (?,?,?)', [`${name}`, `${number}`, "Прошел тест"])

            return res.status(200).json({ 
                data: { 
                    result: number, 
                    status: "Прошел тест"
                } 
            })
        }
            
        else {
            await connect.execute('INSERT INTO `result`(`name`, `result`, `status`) VALUES (?,?,?)', [`${name}`, `${number}`, "Не прошел тест"])

            return res.status(200).json({ 
                data: { 
                    result: number, 
                    status: "Не прошел тест"
                } 
            })
        }
    }
}

module.exports = new Test()