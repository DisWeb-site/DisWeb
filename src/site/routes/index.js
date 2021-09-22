const { CheckAuth } = global;
const express = require("express");
const router = express.Router();
//GET /
router.get("/", (req, res) => {
    res.render("index");
});
//GET /login
router.get("/login", CheckAuth, (req, res) => {
    res.redirect("/discord/login");
});
module.exports = router;
