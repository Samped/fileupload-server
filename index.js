const express = require("express");
const app = express();

const PORT = 3001;

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));


app.listen(PORT, () =>{
    console.log("Server is running is port:", PORT)
});