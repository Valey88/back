const express = require("express")
const user = require("../controller/userController")
const test = require("../controller/testController")
const modules = require("../controller/moduleController")
const reviews = require("../controller/reviewsController")

const router = express() 

// User
router.post("/signin", user.login)
router.post("/signup", user.register)
router.get("/profile", user.infoByToken)
router.post("/upload/profileIcon", user.profileIcon)
router.get("/upload/profileIcon/:id", user.profileIconSet)

// Modules
router.get("/modules", modules.modules)
router.get("/module/:name_id", modules.module)
router.post("/module", modules.module_create)

// reviews
router.get("/reviews", reviews.reviews)
router.post("/module_create", reviews.reviews_create)

// Test
router.get("/test/name", test.isTestReadyName)
router.get("/test/:id", test.isTestReady)
router.post("/test/result", test.isTestResult)

module.exports = router