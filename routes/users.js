const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { getUsers, getUser } = require('../controllers/users');

router.get('/', getUsers);

router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().length(24).hex(),
  }),
}), getUser);

module.exports = router;
