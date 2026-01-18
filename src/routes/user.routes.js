const express = require("express");
const auth = require("../middelwatre/autorizathion");
const {createUser} = require("../controllers/user.controller");
const user = require("../models/user");
const userRouter = express.Router();

userRouter.post("/", async (req, res) => {
  res.send("User route is working");
});