const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;

const NotAuthError = require('../errors/NotAuthError');

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) throw new NotAuthError('Необходима авторизация');

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret-key');
  } catch (err) {
    throw new NotAuthError('Необходима авторизация');
  }

  req.user = payload;
  next();
};
