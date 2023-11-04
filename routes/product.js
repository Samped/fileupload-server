const express = require("express");
const router = express.Router();
const upload = require("../utils/fileUpload")
const { isAuthenticated, isSeller, isBuyer } = require("../middlewares/auth");
const Product = require("../model/productModel");
const Order = require("../model/orderModel");
const { stripeKey } = require("../config/credentials");
const stripe = require("stripe")(stripeKey);
const { WebhookClient } = require("discord.js");

const webhook = new WebhookClient({
    url: "enter your discord webhook url here",
})


router.post("/create", isAuthenticated, isSeller, (req, res) => {
    upload(req, res, async(err) => {
        if(err) {
            console.log('coming in err',err);
            return res.status(500).send(err);
        }
        console.log(req.body.name, req.body.price, req.file);

        const { name, price } = req.body;
        if(!name || !price || !req.file) {
            return res.status(400).json({
                err: "All fields should be selected - name, price, file"
            }),
            console.log(">>>>>>>", err)
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

router.post("/buy/:productId", isAuthenticated, isBuyer, async (req, res) => {
    try {
        const product = await Product.findOne({
            where: { id: req.params.productID }
        })?.dataValues;

        if(!product) {
            return res.status(404).json({ err: "No product found"});
        }

        const orderDetails = {
            productId,
            buyerId: req.user.id,

        }

        let paymentMethod = await stripe.paymentMethod.create({
            type: "card",
            card: {
                number: "1616161616161616",
                exp_montn: 9,
                exp_year: 2023,
                cvc: "404"
            },
        });

        let paymentIntent = await stripe.paymentIntent.create({
            amount: product.price,
            currency: "USD",
            payment_method_types: [card],
            payment_method: paymentMethod.id,
            confirm: true
        });

        if(paymentIntent) {
            const createOrder = await Order.create(orderDetails);
            
            webhook.send({
                content: `Order Details\nOrderID:${createdOrder.id}\nProduct ID: ${createdOrder.productID}\nProduct Name: ${createdOrder.productName}\nProduct Price: ${createdOrder.productPrice}\nBuyer Name:${req.user.name}\nBuyer Email: ${createdOrder.buyerEmail}`,
                username: "Order-keeper",
                avatarURL: "https://i.imgur.com/AfFp7pu.png",
            })
            return res.status(200).json({
                createOrder
            })
        } else {
            return res.status(400).json({
                err: "payment failed"
            })
        }

    } catch (e) {
        return res.status(500).json({ err:e });
    }
})

module.exports = router;