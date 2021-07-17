const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const NotAuthError = require('../errors/NotAuthError');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Жак-Ив Кусто',
    minlength: 2,
    maxlength: 30,
  },
  about: {
    type: String,
    default: 'Исследователь',
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator(avatar) {
        return /^(http:|https:)\/\/w*\w/.test(avatar);
      },
      message: 'Укажите корректную ссылку',
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(email) {
        return validator.isEmail(email);
      },
      message: 'Email некорректный',
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    validate: {
      validator(password) {
        return validator.isStrongPassword(password);
      },
      message:
        'Не является надежным паролем. Длина должна быть не менее 8 символов',
    },
    select: false,
  },
});

userSchema.statics.findUserByEmail = function fn(email, password) {
  return this.findOne({ email }).select('+password')
    .orFail(() => new NotAuthError('Передан неверный логин или пароль'))
    .then((user) => bcrypt.compare(password, user.password)
      .then((matched) => {
        if (!matched) throw new NotAuthError('Передан неверный логин или пароль');
        return user;
      }));
};

module.exports = mongoose.model('user', userSchema);
