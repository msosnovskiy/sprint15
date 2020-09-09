const { NODE_ENV, JWT_SECRET } = process.env;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ConflictError = require('../errors/ConflictError');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user === null) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      res.send({ data: user });
    })

    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('передан некорректный ID пользователя');
      } else next(err);
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  if (!password) {
    throw new BadRequestError('Пароль является обязательным для заполения');
  } else {
    bcrypt.hash(req.body.password, 10)
      .then((hash) => User.create({
        name,
        about,
        avatar,
        email,
        password: hash,
      }))
      .then(() => res.send({
        name, about, avatar, email,
      }))
      // .catch((err) => {
      //   if (err.name === 'ValidationError') {
      //     res.status(400).send({ message: err.message });
      //     return;
      //   }
      //   if (err.name === 'MongoError' || err.code === 11000) {
      //     res.status(409).send({ message: 'Указанный email уже занят' });
      //   } else res.status(500).send({ message: 'На сервере произошла ошибка' });
      // })
      .catch((err) => {
        if (err.name === 'ValidationError') {
          throw new NotFoundError(err.message);
        }
        if (err.name === 'MongoError' || err.code === 11000) {
          throw new ConflictError('Указанный email уже занят');
        } else next(err);
      })
      .catch(next);
  }
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      res.send({
        token: jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret-key', { expiresIn: '7d' }),
      });
    })
    .catch((err) => {
      res.status(401).send({ message: err.message });
    });
};
