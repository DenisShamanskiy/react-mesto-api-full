const jwt = require("jsonwebtoken");
const NotAuthError = require("../errors/not-auth-error");

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer "))
    throw new NotAuthError("Необходима авторизация");

  const token = authorization.replace("Bearer ", "");
  let payload;

  try {
    payload = jwt.verify(
      token,
      NODE_ENV === "production" ? JWT_SECRET : "dev-secret-key"
    );
  } catch (err) {
    throw new NotAuthError("Необходима авторизация");
  }

  req.user = payload;
  next();
};

/*
const jwt = require('jsonwebtoken');
const NotAuthError = require('../errors/not-auth-error');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const { jwt: token } = req.cookies;
  if (!token) {
    next(new NotAuthError('Необходима авторизация'));
  }
  let payload;
  try {
    payload = jwt.verify(
      token,
      NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
    );
  } catch (err) {
    next(new NotAuthError('Необходима авторизация'));
  }
  req.user = payload;
  next();
};
*/
