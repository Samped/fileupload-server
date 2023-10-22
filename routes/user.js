const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt"); //* bcrypt is a 3rd party library which we use to hash, salt and compare passwords
const User = require("../model/userModel");

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


module.exports = router;