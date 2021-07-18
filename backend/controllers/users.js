const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { OK_CODE_200 } = require('../utils/constants');

const { NODE_ENV, JWT_SECRET } = process.env;

const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .orFail(() => new NotFoundError('Пользователи не найдены'))
    .then((users) => res.status(OK_CODE_200).send(users))
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  const id = req.user._id;
  User.findById(id)
    .orFail(() => new NotFoundError('Пользователь не найден'))
    .then((user) => res.status(OK_CODE_200).send(user))
    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail(
      () => new BadRequestError(
        'Переданы некорректные данные при поиске пользователя',
      ),
    )
    .then((user) => res.status(OK_CODE_200).send(user))
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10).then((hash) => User.create({
    name,
    about,
    avatar,
    email,
    password: hash,
  })
    .then((user) => res.status(OK_CODE_200).send({
      _id: user._id,
      email: user.email,
    }))
    .catch(next));
};

module.exports.updateUser = (req, res, next) => {
  const id = req.user._id;
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    id,
    { name, about },
    { new: true, runValidators: true },
  )
    .orFail(() => new NotFoundError('Пользователь не найден'))
    .then((user) => res.status(OK_CODE_200).send(user))
    .catch(next);
};

module.exports.updateAvatar = (req, res, next) => {
  const id = req.user._id;
  const { avatar } = req.body;
  User.findByIdAndUpdate(id, { avatar }, { new: true, runValidators: true })
    .orFail(() => new NotFoundError('Пользователь не найден'))
    .then((user) => res.status(OK_CODE_200).send(user))
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByEmail(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret-key',
        { expiresIn: '7d' },
      );
      res.status(OK_CODE_200).send({ token });
    })
    .catch(next);
};
