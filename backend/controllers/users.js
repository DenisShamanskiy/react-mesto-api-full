const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { OK_CODE_200 } = require('../utils/constants');

const { NODE_ENV, JWT_SECRET } = process.env;

const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ConflictError = require('../errors/ConflictError');
const NotAuthError = require('../errors/NotFoundError');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(OK_CODE_200).send(users))
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  const { _id } = req.user;

  User.findById(_id)
    .orFail(new Error('NotValidId'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        throw new NotFoundError('Пользователь не найден');
      }
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные при поиске пользователя');
      }
      next(err);
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => res.status(OK_CODE_200).send({
      _id: user._id,
      email: user.email,
    }))
    .catch((err) => {
      if (err.name === 'MongoError' && err.code === 11000) {
        throw new ConflictError(`Пользователь с Email ${req.body.email} уже существует`);
      }
      return next(err);
    })
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;
  const id = req.user._id;
  User.findByIdAndUpdate(
    id,
    { name, about },
    { new: true, runValidators: true },
  )
    .orFail(new Error('NotValidId'))
    .then((user) => res.status(OK_CODE_200).send(user))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        throw new NotFoundError('Пользователь не найден');
      }
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        throw new BadRequestError('Переданы некорректные данные при поиске пользователя');
      }
      next(err);
    })
    .catch(next);
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const id = req.user._id;
  User.findByIdAndUpdate(
    id,
    { avatar },
    { new: true, runValidators: true },
  )
    .orFail(new Error('NotValidId'))
    .then((user) => res.status(OK_CODE_200).send(user))
    .catch((err) => {
      if (err.message === 'NotValidId') {
        throw new NotFoundError('Пользователь не найден');
      }
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        throw new BadRequestError('Переданы некорректные данные при поиске пользователя');
      }
      next(err);
    })
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
    .catch(() => {
      throw new NotAuthError('Передан неверный логин или пароль');
    })
    .catch(next);
};
