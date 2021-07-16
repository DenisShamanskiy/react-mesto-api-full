const jsonwebtoken = require("jsonwebtoken");
const NotAuthError = require("../errors/not-auth-error");
const { randomString } = require("../utils/constants");

const auth = (req, res, next) => {
  const { jwt } = req.cookies;
  const { NODE_ENV, JWT_SECRET } = process.env;
  console.log(req);
  console.log(jwt);
  console.log(NODE_ENV, JWT_SECRET);

  try {
    if (!jwt) {
      throw new NotAuthError("C токеном что-то не так");
    }
  } catch (err) {
    next(err);
  }

  try {
    jsonwebtoken.verify(
      jwt,
      NODE_ENV === "production" ? JWT_SECRET : randomString,
      (err, decoded) => {
        if (err) {
          throw new NotAuthError("Необходима авторизация");
        }
        req.user = decoded;
        next();
      }
    );
  } catch (err) {
    next(err);
  }
};

module.exports = auth;

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
