const Card = require('../models/card');
const NotFoundError = require('../errors/NotFoundError');
const NoRulesError = require('../errors/NoRulesError');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    // .orFail(() => new NotFoundError('Карточки не найдены'))
    .then((cards) => res.status(200).send(cards))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const userId = req.user._id;
  Card.create({ name, link, owner: userId })
    .then((card) => res.status(200).send(card))
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  const userId = req.user._id;
  Card.findById(cardId)
    .orFail(() => new NotFoundError('Карточка не найдена'))
    .then((card) => {
      if (String(card.owner) !== userId) {
        throw new NoRulesError('Нет прав для удаления карточки');
      }
      return card._id;
    })
    .then((id) => Card.findByIdAndRemove(id)
      .then(() => res.status(200).send({ message: 'Карточка удалена' })))
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  const userId = req.user._id;
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: userId } }, { new: true })
    .orFail(() => new NotFoundError('Карточка не найдена'))
    .then((card) => res.status(200).send(card))
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  const userId = req.user._id;
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: userId } }, { new: true })
    .orFail(() => new NotFoundError('Карточка не найдена'))
    .then((card) => res.status(200).send(card))
    .catch(next);
};
