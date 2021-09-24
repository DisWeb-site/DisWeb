const { CheckAuth } = global;
const express = require("express");
const router = express.Router();
//GET /
router.get("/", (req, res) => {
    res.redirect("/bots");
});
//GET /login
router.get("/login", CheckAuth, (req, res) => {
    res.redirect("/discord/login");
});
//GET /logout
router.get("/logout", async (req, res) => {
    await req.session.destroy();
    res.send("Logged out");
    res.end();
});
//GET /team
router.get("/team", (req, res) => {
    res.render("team", {
        req,
    });
});
//GET /about
router.get("/about", (req, res) => {
    res.render("about", {
        req,
    });
});
//GET /team
router.get("/terms", (req, res) => {
    res.render("terms", {
        req,
    });
});
//GET /privacy-policy
router.get("/privacy-policy", (req, res) => {
    res.send("Coming Soon");
});
module.exports = router;
