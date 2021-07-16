const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const { celebrate, Joi, errors } = require('celebrate');
const cors = require('cors');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const { createUser, login } = require('./controllers/users');
const auth = require('./middlewares/auth');
const errorHandler = require('./middlewares/err');
const corsOption = require('./middlewares/corsOption');
const NotFoundError = require('./errors/NotFoundError');
const { requestLogger, errorLogger } = require('./middlewares/logger');
require('dotenv').config();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

const { PORT = 3000 } = process.env;
const app = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(requestLogger);
app.use(cors(corsOption));

// удалить после ревью
app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().pattern(new RegExp('^[a-z0-9-_.]{1,20}@[a-z0-9-_.]{1,20}\\.[a-z]{2,5}$')),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(20),
    about: Joi.string().min(2).max(30),
    // eslint-disable-next-line max-len,no-useless-escape
    avatar: Joi.string().pattern(new RegExp(/^(http|https):\/\/[A-za-z0-9-._~:/?#\[\]@!$&'()*+,;=]{1,}$/)),
  }),
}), createUser);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().pattern(new RegExp('^[a-z0-9-_.]{1,20}@[a-z0-9-_.]{1,20}\\.[a-z]{2,5}$')),
    password: Joi.string().required(),
  }),
}), login);

app.use('/cards', auth, cardsRouter);
app.use('/users', auth, usersRouter);

app.get('/', (req, res, next) => {
  if (req) throw new NotFoundError('Запрашиваемый ресурс не найден');
  next();
});

app.post('/', (req, res, next) => {
  if (req) throw new NotFoundError('Запрашиваемый ресурс не найден');
  next();
});

app.get('/:path', (req, res, next) => {
  if (req.params.path) throw new NotFoundError('Запрашиваемый ресурс не найден');
  next();
});

app.post('/:path', (req, res, next) => {
  if (req.params.path) throw new NotFoundError('Запрашиваемый ресурс не найден');
  next();
});

app.use(errorLogger);

app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
