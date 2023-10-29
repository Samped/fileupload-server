const express = require("express");
const router = express.Router();
const upload = require("../utils/fileUpload")
const { isAuthenticated, isSeller } = require("../middlewares/auth");
const Product = require("../model/productModel");


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

        const savedProduct = await Product.create(productDetails);

        return res.status(200).json({
            status: 'ok',
            productDetails
        })
    });
});

router.get("/get/all", isAuthenticated, async(req, res) => {
    try {
        const products = await Product.findAll();
        return res.status(200).json({
            products
        })
    } catch (e) {
        return res.status(500).json({ err: e});
    }
});

module.exports = router;