const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const LoginError = require('../errors/LoginError');

// напишите код здесь
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    // validate: {
    //   validator(v) {
    //     return /^[a-za-яё0-9 -]+$/i.test(v);
    //   },
    //   message: 'Укажите корректное название',
    // },
    minlength: 2,
    maxlength: 20,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    // validate: {
    //   validator(v) {
    //     return /^[a-za-яё0-9 -]+$/i.test(v);
    //   },
    //   message: 'Укажите корректное название',
    // },
    minlength: 2,
    maxlength: 30,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    validate: {
      validator(v) {
        // eslint-disable-next-line no-useless-escape
        return /^(http|https):\/\/[A-za-z0-9-._~:/?#\[\]@!$&'()*+,;=]{1,}$/.test(v);
      },
      message: 'Укажите корректную ссылку',
    },
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },
  email: {
    type: String,
    validate: {
      validator(v) {
        return /^[a-z0-9-_.]{1,20}@[a-z0-9-_.]{1,20}\.[a-z]{2,5}$/.test(v);
      },
      message: 'Укажите почту в формате name@email.domen',
    },
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

userSchema.statics.findUserByEmail = function (email, password) {
  return this.findOne({ email }).select('+password')
    .orFail(() => new LoginError('Неправильные почта или пароль'))
    .then((user) => bcrypt.compare(password, user.password)
      .then((matched) => {
        if (!matched) throw new LoginError('Неправильные почта или пароль');
        return user;
      }));
};

module.exports = mongoose.model('user', userSchema);
