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
                err: "All fields should be selected - name, price, file"
            })
        }

        if(Number.isNaN(price)) {
            return res.status(400).json({
                err: "price should be number"
            })
        }

        let productDetails = {
            name,
            price,
            content: req.file.path
        }

        return res.status(200).json({
            status: 'ok',
            productDetails
        })
    });
});


module.exports = router;