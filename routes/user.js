const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt"); //* bcrypt is a 3rd party library which we use to hash, salt and compare passwords
const User = require("../model/userModel");
const jwt = require("jsonwebtoken");

const {
  validateName,
  validateEmail,
  validatePassword,
} = require("../utils/validators");

router.post("/signup", async (req, res) => {
  try {
    // destructuring name, email and password out of the request body
    const { name, email, password, isSeller } = req.body; 

    //* check if the user with the entered email already exists in the database
    const existingUser = await User.findOne({ where: { email} }); 
    if (existingUser) {
      return res.status(403).json({ err: "User already exists" });
    }
    //validates all user inputs (name, email, password, isSeller||not)
    if (!validateName(name)) {
      return res.status(400).json({
        err: "Invalid user name: name must be longer than two characters and must not include any numbers or special characters",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ err: "Error: Invalid email" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        err: "Error: Invalid password: password must be at least 8 characters long and must include atleast one - one uppercase letter, one lowercase letter, one digit, one special character",
      });
    }
    //hashes password with saltorrounds
    const hashedPassword = await bcrypt.hash(password, (saltOrRounds = 10)); 

    const user = {
      email,
      name,
      password: hashedPassword,
      isSeller: false,
    };
    //creates the user
    const createdUser = await User.create(user);

    return res.status(201).json({
      message: `Welcome to Devsnest ${createdUser.name}. Thank you for signing up`,
    });
  } catch (err) {
    return res.status(500).json({ err: err.message });
  }
});

router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;

        if(email.length === 0) {
            return res.status(400).json({
                err: "please input your email"
            });
        };
        if(password.length === 0) {
            return res.status(400).json({
                err: "please input your password"
            });
        };

        const existingUser = await User.findOne({ where : {email} });
        if(!existingUser) {
            return res.status(404).json({
                err: "User not found"
            });
        };

        const passwordMatch = await bcrypt.compare(password, existingUser.password);
        if(!passwordMatch) {
            return res.status(400).json({
                err: "email or password not correct"
            });
        };

        const payload = { user: {id: existingUser.id}};
        const bearerToken = await jwt.sign(payload, "SECRET MESSAGE", {
            expiresIn: 360000,
        });

        res.cookie('t', bearerToken, {expire: new Date() + 999});

        return res.status(200).json({
            bearerToken
        })
    } catch (e) {
        return res.status(500).send(e);
    };
});

router.get("/signout", (req, res) => {
    try {
        res.clearCookie('t');
        return res.status(200).json({
            message: "cookie delected"
        });
    } catch (e) {
        return res.status(500).send(e);
    }
})

module.exports = router;