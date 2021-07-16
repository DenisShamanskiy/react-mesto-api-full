// eslint-disable-next-line no-unused-vars
const customErrorsHandler = (err, req, res, next) => {
  if (err.name === 'ValidatorError' || err.name === 'CastError') return res.status(400).send({ message: 'Переданы некорректные данные' });
  if (err.name === 'MongoError' && err.code === 11000) return res.status(409).send({ message: (`Пользователь с Email ${req.body.email} уже существует`) });
  const { statusCode = 500, message = 'На сервере произошла ошибка' } = err;
  return res.status(statusCode).send({ message });
};

module.exports = customErrorsHandler;