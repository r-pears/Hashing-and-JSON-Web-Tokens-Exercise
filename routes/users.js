const Router = require("express").Router;
const User = require("../models/user");
const {  ensureCorrectUser, ensureLoggedIn } = require("../middleware/auth");

const router = new Router();

/** GET / - get list of users. */
router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    let users = await User.all();

    return res.json({ users });
  } catch (error) {
    return next(error);
  }
});

/** GET /:username - get detail of users. */
router.get("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    let user = await User.get(req.params.username);

    return res.json({ user });
  } catch (error) {
    return next(error);
  }
});

/** GET /:username/to - get messages to user */
router.get("/:username/to", ensureCorrectUser, async function (req, res, next) {
  try {
    let messages = await User.messagesTo(req.params.username);

    return res.json({ messages });
  } catch (error) {
    return next(error);
  }
});

/** GET /:username/from - get messages from user */
router.get("/:username/from", ensureCorrectUser, async function (req, res, next) {
  try {
    let messages = await User.messagesFrom(req.params.username);

    return res.json({ messages });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;