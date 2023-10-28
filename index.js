const express = require("express")
const cors = require("cors")
const router = require("./routers/router")
const fileUpload = require('express-fileupload');
const path = require('path')

const PORT = process.env.PORT || 3001
const HOST = 'localhost'
const app = express()

app.use(express.json())
app.use(cors())
app.use(fileUpload({}));

app.use('/images', express.static(path.join(__dirname, 'public')))
app.use("/api", router)

app.listen(PORT, HOST, () => {
    console.log("server started on port: " + PORT)
})