const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { validIsURL } = require('../utils/constants');

const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

router.get('/', getCards);

router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    // eslint-disable-next-line no-useless-escape
    link: Joi.string().required().custom(validIsURL),
  }),
}),
createCard);

router.delete('/:cardId', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required(),
  }),
}),
deleteCard);

router.put('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required(),
  }),
}),
likeCard);

router.delete('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required(),
  }),
}),
dislikeCard);

module.exports = router;
