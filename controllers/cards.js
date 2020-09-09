const Card = require('../models/card');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError(err.message);
      } else next(err);
    })
    .catch(next);
};

module.exports.removeCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail()
    .then(async (card) => {
      const userId = req.user._id;
      const ownerId = card.owner._id.toString();
      if (ownerId === userId) {
        const element = await Card.findByIdAndDelete(req.params.cardId);
        res.send({ data: element });
      } throw new BadRequestError('Нет прав на удаление');
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new ForbiddenError('передан некорректный ID карточки');
      }
      if (err.name === 'DocumentNotFoundError') {
        throw new NotFoundError('не удалось найти карточку');
      } else next(err);
    })
    .catch(next);
};
