import { urlServer } from "./constants";

class Auth {
  constructor(urlServer) {
    this._urlServer = urlServer;
  }

  _handleOriginalResponse(res) {
    if (res.ok) {
      return res.json();
    } else {
      return Promise.reject(`Ошибка ${res.status}`);
    }
  }

  checkToken() {
    return fetch(`${this._urlServer}/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then(this._handleOriginalResponse);
  }

  register({ email, password }) {
    return fetch(`${this._urlServer}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: password,
        email: email,
      }),
    }).then(this._handleOriginalResponse);
  }

  login({ email, password }) {
    return fetch(`${this._urlServer}/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: password,
        email: email,
      }),
    }).then(this._handleOriginalResponse);
  }
}

const auth = new Auth(urlServer);

export default auth;
