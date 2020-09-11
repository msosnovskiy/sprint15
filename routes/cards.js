const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { getCards, createCard, removeCard } = require('../controllers/cards');

router.get('/', getCards);

router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required(),
    link: Joi.string().required().min(8),
  }),
}), createCard);

router.delete('/:cardId', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().length(24).hex(),
  }),
}), removeCard);

module.exports = router;
