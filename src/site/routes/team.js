const express = require("express");
const router = express.Router();
//GET /team
router.get("/", (req, res) => {
    res.render("team", {
        req: req,
    });
});
module.exports = router;
