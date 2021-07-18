const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { validIsURL } = require('../utils/constants');

const {
  getUsers,
  updateUser,
  updateAvatar,
  getCurrentUser,
  getUserById,
} = require('../controllers/users');

router.get('/', getUsers);

router.get('/me', getCurrentUser);

router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().required().hex().length(24),
  }),
}), getUserById);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(20),
    about: Joi.string().required().min(2).max(30),
  }),
}),
updateUser);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().custom(validIsURL),
  }),
}),
updateAvatar);

module.exports = router;
