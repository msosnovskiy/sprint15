module.exports = class AuthorizationRequestError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 401;
  }
};
