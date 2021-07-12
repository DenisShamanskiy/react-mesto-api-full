const jwt = require("jsonwebtoken");
const NotAuthError = require("../errors/not-auth-error");

const { NODE_ENV, JWT_SECRET } = process.env;

const extractBearerToken = (header) => header.replace("Bearer ", "");

module.exports = (req, res, next) => {
  // const { jwt: token } = req.cookies;
  const { authorization } = req.headers;

  // if (!token) {
  //   next(new UnauthorizedError('Необходима авторизация.'));
  // }

  if (!authorization || !authorization.startsWith("Bearer ")) {
    next(new NotAuthError("Необходима авторизация."));
  }

  const token = extractBearerToken(authorization);
  let payload;

  try {
    payload = jwt.verify(
      token,
      NODE_ENV === "production" ? JWT_SECRET : "dev-secret"
    );
  } catch (err) {
    next(new NotAuthError("Необходима авторизация."));
  }

  req.user = payload;
  next();
};
