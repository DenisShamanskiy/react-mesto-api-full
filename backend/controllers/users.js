const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const User = require("../models/user");

const { OK_CODE_200, randomString } = require("../utils/constants");

const NotFoundError = require("../errors/not-found-error");
const BadRequestError = require("../errors/bad-request-error");
const ConflictError = require("../errors/conflict-error");
const NotAuthError = require("../errors/not-auth-error");

const { NODE_ENV, JWT_SECRET } = process.env;

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user) throw new NotAuthError("Неправильные почта или пароль");

    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      throw new NotAuthError("Неправильные почта или пароль");
    } else {
      const token = jsonwebtoken.sign(
        { _id: user._id },
        NODE_ENV === "production" ? JWT_SECRET : randomString,
        { expiresIn: "7d" }
      );
      // res.status(200).cookie('jwt', token, {
      //   maxAge: 3600000 * 24 * 7, httpOnly: true, sameSite: 'none', secure: true,
      // })
      res
        .status(OK_CODE_200)
        .cookie("jwt", token, {
          maxAge: 3600000 * 24 * 7,
          domain: ".example.com",
          path: "/admin",
          secure: true,
        })
        .send({ message: "Вы успешно авторизованы!" });
    }
  } catch (error) {
    next(error);
  }
};

/* function login(req, res, next) {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === "production" ? JWT_SECRET : randomString,
        { expiresIn: "7d" }
      );
      res
        .status(OK_CODE_200)
        .cookie("jwt", token, {
          maxAge: 7 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          sameSite: true,
        })
        .send({ message: "Вход успешно выполнен" });
    })
    .catch(() => {
      throw new NotAuthError("Передан неверный логин или пароль");
    })
    .catch(next);
} */

const logout = async (req, res, next) => {
  try {
    const { email } = req.body;
    const { jwt } = req.cookies;

    let verifiedUser = null;

    if (!jwt) {
      throw new NotAuthError("C токеном что-то не так");
    }

    const user = await User.findOne({ email });

    if (!user) throw new NotFoundError("Пользователь с такой почтой не найден");

    jsonwebtoken.verify(
      jwt,
      NODE_ENV === "production" ? JWT_SECRET : randomString,
      (err, decoded) => {
        if (err) {
          throw new NotAuthError("Необходима авторизация");
        }
        verifiedUser = decoded;

        if (user._id.toHexString() !== verifiedUser._id) {
          throw new NotAuthError("Необходима авторизация");
        }
      }
    );
    res
      .status(200)
      .clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true })
      .send({ message: "Вы успешно вышли из системы!" });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    next(error);
  }
};
/*
function getUsers(req, res, next) {
  User.find({})
    .then((users) => res.status(OK_CODE_200).send(users))
    .catch(next);
}*/

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) throw new NotFoundError("Запрашиваемый пользователь не найден");
    res.send(user);
  } catch (error) {
    next(error);
  }
};

/*
function getUserById(req, res, next) {
  User.findById(req.params.userId)
    .orFail(new Error("NotValidId"))
    .then((user) => res.status(OK_CODE_200).send(user))
    .catch((err) => {
      if (err.message === "NotValidId") {
        throw new NotFoundError("Пользователь не найден");
      }
      if (err.name === "CastError") {
        throw new BadRequestError(
          "Переданы некорректные данные при поиске пользователя"
        );
      }
      next(err);
    })
    .catch(next);
}*/

const getCurrentUser = async (req, res, next) => {
  const { user } = req;
  try {
    const foundUser = await User.findById(user._id);
    if (!foundUser) throw new NotFoundError("Текущий пользователь не найден");
    res.send(foundUser);
  } catch (error) {
    next(error);
  }
};

/*function getCurrentUser(req, res, next) {
  const { _id } = req.user;

  User.findById(_id)
    .orFail(new Error("NotValidId"))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.message === "NotValidId") {
        throw new NotFoundError("Пользователь не найден");
      }
      if (err.name === "CastError") {
        throw new BadRequestError(
          "Переданы некорректные данные при поиске пользователя"
        );
      }
      next(err);
    })
    .catch(next);
}*/

function createUser(req, res, next) {
  const { name, about, avatar, email, password } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) =>
      User.create({
        name,
        about,
        avatar,
        email,
        password: hash,
      })
    )
    .then((user) =>
      res.status(OK_CODE_200).send({
        _id: user._id,
        email: user.email,
      })
    )
    .catch((err) => {
      if (err.name === "MongoError" && err.code === 11000) {
        throw new ConflictError(
          `Пользователь с Email ${req.body.email} уже существует`
        );
      }
      return next(err);
    })
    .catch(next);
}

function updateUser(req, res, next) {
  const { name, about } = req.body;
  const id = req.user._id;
  User.findByIdAndUpdate(
    id,
    { name, about },
    { new: true, runValidators: true }
  )
    .orFail(new Error("NotValidId"))
    .then((user) => res.status(OK_CODE_200).send(user))
    .catch((err) => {
      if (err.message === "NotValidId") {
        throw new NotFoundError("Пользователь не найден");
      }
      if (err.name === "CastError" || err.name === "ValidationError") {
        throw new BadRequestError(
          "Переданы некорректные данные при поиске пользователя"
        );
      }
      next(err);
    })
    .catch(next);
}

function updateAvatar(req, res, next) {
  const { avatar } = req.body;
  const id = req.user._id;
  User.findByIdAndUpdate(id, { avatar }, { new: true, runValidators: true })
    .orFail(new Error("NotValidId"))
    .then((user) => res.status(OK_CODE_200).send(user))
    .catch((err) => {
      if (err.message === "NotValidId") {
        throw new NotFoundError("Пользователь не найден");
      }
      if (err.name === "CastError" || err.name === "ValidationError") {
        throw new BadRequestError(
          "Переданы некорректные данные при поиске пользователя"
        );
      }
      next(err);
    })
    .catch(next);
}

module.exports = {
  login,
  logout,
  getUsers,
  getUserById,
  getCurrentUser,
  createUser,
  updateUser,
  updateAvatar,
};
