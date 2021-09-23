const express = require("express");
const router = express.Router();
//GET /about
router.get("/", (req, res) => {
    res.render("about", {
        req: req,
    });
});
module.exports = router;
