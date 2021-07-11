const CORS_WHITELIST = [
  "https://praktikum.tk",
  "http://praktikum.tk",
  "http://shamanskiy.15.nomoredomains.monster",
  "https://shamanskiy.15.nomoredomains.monster",
  "localhost:3000",
];
const corsOption = {
  credentials: true,
  origin: function checkCorsList(origin, callback) {
    if (CORS_WHITELIST.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

module.exports = corsOption;
