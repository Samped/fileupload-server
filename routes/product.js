const express = require("express");
const router = express.Router();
const upload = require("../utils/fileUpload")
const { isAuthenticated, isSeller } = require("../middlewares/auth");


router.post("/create", isAuthenticated, isSeller, (req, res) => {
    upload(req, res, async(err) => {
        if(err) {
            console.log('coming in err',err);
            return res.status(500).send(err);
        }
        const { name, price } = req.body;
        if(!name || !price || !req.file) {
            return res.status(400).json({
                
            })
        }
    })
});





module.exports = router;