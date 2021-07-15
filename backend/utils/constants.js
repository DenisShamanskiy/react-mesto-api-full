const validator = require("validator");

const OK_CODE_200 = 200;
const urlServer = "localhost:27017";
const database = "mestodb";
const randomString = "dev-secret";

const validIsURL = (value) => {
  const result = validator.isURL(value);
  if (result) {
    return value;
  }
  throw new Error("Ссылка некорректна");
};

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://shamanskiy.15.nomoredomains.monster",
    "http://shamanskiy.15.nomoredomains.monster",
  ],
  credentials: true,
};

module.exports = {
  corsOptions,
  urlServer,
  database,
  randomString,
  OK_CODE_200,
  validIsURL,
};
