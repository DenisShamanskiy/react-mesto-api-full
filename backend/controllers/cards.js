const Card = require('../models/card');
const { OK_CODE_200 } = require('../utils/constants');

const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');
const BadRequestError = require('../errors/BadRequestError');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.status(OK_CODE_200).send(cards))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.status(OK_CODE_200).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Переданы некорректные данные в метод создания карточки');
      }
      next(err);
    })
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  const userId = req.user._id;
  Card.findById(cardId)
    .orFail(() => new NotFoundError('Карточка не найдена'))
    .then((card) => {
      if (String(card.owner) !== userId) {
        throw new ForbiddenError('Попытка удалить чужую карточку');
      }
      return card._id;
    })
    .then((id) => Card.findByIdAndRemove(id)
      .then(() => res.status(OK_CODE_200).send({ message: 'Карточка удалена' })))
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  const userId = req.user._id;
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: userId } }, { new: true })
    .orFail(() => new NotFoundError('Карточка не найдена'))
    .then((card) => res.status(OK_CODE_200).send(card))
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  const userId = req.user._id;
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: userId } }, { new: true })
    .orFail(() => new NotFoundError('Карточка не найдена'))
    .then((card) => res.status(OK_CODE_200).send(card))
    .catch(next);
};
