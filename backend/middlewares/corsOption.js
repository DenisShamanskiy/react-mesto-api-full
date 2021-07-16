const CORS_WHITELIST = [
  'http://localhost:3000',
  'http://localhost:8080',
  'https://shamanskiy.15.nomoredomains.monster',
  'http://shamanskiy.15.nomoredomains.monster',
];
const corsOption = {
  credentials: true,
  origin: function checkCorsList(origin, callback) {
    if (CORS_WHITELIST.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

module.exports = corsOption;
