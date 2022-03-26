const jwt = require("jsonwebtoken");
const Router = require("express").Router;
const router = new Router();

const User = require("../models/user");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../expressError");

/** POST /login - login: {username, password} => {token} */
router.post("/login", async function (req, res, next) {
  try {
    let { username, password } = req.body;

    if (await User.authenticate(username, password)) {
      let token = jwt.sign({ username }, SECRET_KEY);
      User.updateLoginTimestamp(username);

      return res.json({ token });
    } else {
      throw new ExpressError(`Invalid username/password`, 400);
    }
  } catch (error) {
    return next(error);
  }
});

/** POST /register - register user: registers, logs in, and returns token. */
router.post("/register", async function (req, res, next) {
  try {
    let { username } = await User.register(req.body);
    let token = jwt.sign({ username }, SECRET_KEY);
    User.updateLoginTimestamp(username);

    return res.json({ token });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
