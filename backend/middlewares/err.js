// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err.name === 'ValidatorError' || err.name === 'CastError') return res.status(400).send({ message: 'Переданы некорректные данные' });
  if (err.name === 'MongoError' && err.code === 11000) return res.status(409).send({ message: 'Не удаётся зарегистрировать пользователя' });
  const { statusCode = 500, message = 'Произошла ошибка на сервере' } = err;
  return res.status(statusCode).send({ message });
};

module.exports = errorHandler;
