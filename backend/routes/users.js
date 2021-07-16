const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  getUsers, changeUser, changeAvatar, getMe, getUser,
} = require('../controllers/users');

router.get('/me', getMe);

router.get('/', getUsers);

router.get('/:userId', getUser);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(20),
    about: Joi.string().required().min(2).max(30),
  }),
}), changeUser);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    // eslint-disable-next-line no-invalid-regexp,no-useless-escape
    avatar: Joi.string().required().pattern(new RegExp(/^(http|https):\/\/[A-za-z0-9-._~:/?#\[\]@!$&'()*+,;=]{1,}$/)),
  }),
}), changeAvatar);

module.exports = router;
