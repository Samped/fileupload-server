const express = require("express");
const router = express.Router();
const User = require("../model/userModel");
const bcrypt = require("bcrypt");

const {
    validateName,
    validateEmail,
    validatePassword
} = require("../utils/validators");

router.post("/signup", async (req, res) => {
    try {

        const { name, email, password, isSeller } = req.body;

        //checking if user exists in the databass
        const existingUser = await User.findOne({ where: {email}});
        if(existingUser) {
            return res.status(403).json({ err: "User already exists"});
        }

        //validating the user inputs (name, email, password)
        if(!validateName(name)) {
            return res.status(400).json({err: "Name must be at least 3 character long and must not include numbers or special characters"});
        }
        if(!validateEmail(email)) {
            return res.status(400).json({err: "Invalide Email address"});
        }
        if(!validatePassword(password)) {
            return res.status(400).json({err: "Password must be atleast 8 character long and it must include atleast - one uppercase letter, one lowercase letter, one digit, one special character"});
        }

        const hashPassword = await bcrypt.hash(password);

        const user = {
            email,
            name,
            isSeller,
            password: hashPassword
        };

        const createdUser = await User.create(user);

        return res.status(201).json({
            message: `Welcome ${createdUser.name}`
        })

    } catch (e) {
        return res.status(500).send(e);
    }

});

module.exports = router;