const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { secret } = require('../config/environment');

function registerRoute(req, res, next) {
  User
    .create(req.body)
    .then(user => {
      if(!user || !user.validatePassword(req.body.password)) return res.unauthorized();

      const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '1hr' });
      return res.json({ token, message: `Thanks for registering ${user.username}, please login`, user });
    })

    .catch(next);
}

function loginRoute(req, res, next) {
  User
    .findOne({ email: req.body.email })
    .then((user) => {
      if(!user || !user.validatePassword(req.body.password)) return res.status(401).json({ message: 'Unauthorized' });

      const payload = { userId: user.id };
      const token = jwt.sign(payload, secret, { expiresIn: '1hr' });
      return res.json({ token, message: `Welcome back ${user.username}`, userId: user.id });
    })
    .catch(next);
}

function updateRoute(req, res, next) {
  User
    .findById(req.params.id)
    .exec()
    .then((user) => {
      if(!user) return res.notFound();

      Object.assign(user, req.body);
      return user.save();
    })
    .then((user) => res.json(user))
    .catch(next);
}

function showRoute(req, res, next) {
  User
    .findById(req.params.id)
    .populate('createdBy comments.createdBy')
    .exec()
    .then((user) => {
      if(!user) return res.notFound();
      res.json(user);
    })
    .catch(next);
}

module.exports = {
  register: registerRoute,
  login: loginRoute,
  update: updateRoute,
  show: showRoute
};
