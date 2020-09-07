const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validatorUrl = require('validator').isURL;
const validatorEmail = require('validator').isEmail;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'это поле является обязательным для заполения'],
    minlength: [2, 'минимальное количество символов - 2'],
    maxlength: [30, 'максимальное количество символов - 30'],
  },
  about: {
    type: String,
    required: [true, 'это поле является обязательным для заполения'],
    minlength: [2, 'минимальное количество символов - 2'],
    maxlength: [30, 'максимальное количество символов - 30'],
  },
  avatar: {
    type: String,
    required: [true, 'это поле является обязательным для заполения'],
    validate: {
      validator: (v) => validatorUrl(v),
      message: 'передана некорректная ссылка',
    },
  },
  email: {
    type: String,
    required: [true, 'это поле является обязательным для заполения'],
    validate: {
      validator: (v) => validatorEmail(v),
      message: 'указан неверный адрес почтового ящика',
    },
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'это поле является обязательным для заполения'],
    select: false,
  },
});

// eslint-disable-next-line func-names
userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Error('Неправильные почта или пароль'));
          }
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
