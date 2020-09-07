const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: err.message });
      } else res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

module.exports.removeCard = (req, res) => {
  Card.findById(req.params.cardId)
    .orFail()
    .then(async (card) => {
      const userId = req.user._id;
      const ownerId = card.owner._id.toString();
      if (ownerId === userId) {
        const element = await Card.findByIdAndDelete(req.params.cardId);
        res.send({ data: element });
      } else res.status(403).send({ message: 'Нет прав на удаление' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: `передан некорректный ID карточки - ${req.params.cardId}` });
        return;
      }
      if (err.name === 'DocumentNotFoundError') {
        res.status(404).send({ message: `не удалось найти карточку с cardId - ${req.params.cardId}` });
      } else res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};
