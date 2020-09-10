const Card = require('../models/card');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Проверьте передаваемые данные');
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
      } throw new ForbiddenError('Нет прав на удаление');
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Передан некорректный ID карточки');
      }
      if (err.name === 'DocumentNotFoundError') {
        throw new NotFoundError('Не удалось найти карточку');
      } else next(err);
    })
    .catch(next);
};
